const { getUsers, registerUser, getUserByEmail, getUserByToken, getUserById, updateProfile, updateToken } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { bucket } = require('../config/storage');
const { firestore } = require('../config/database');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const loginHandler = async (req, res) => {
    try {
        const userRecord = await getUserByEmail(req.body.email);

        if (userRecord === null) {
            throw new Error('Invalid email');
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, userRecord.password);

        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        const userId = userRecord.id;
        const email = userRecord.email;
        const name = userRecord.name;
        const role = userRecord.role; // Ambil peran pengguna dari userRecord
        const token = jwt.sign({ userId, email, name, role }, process.env.ACCESS_TOKEN_SECRET);

        await updateToken(userId, token);

        res.cookie('token', token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true
        });

        res.status(200).json({ message: 'User logged in successfully', data: { userId, email, name, role, token } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const registerUserHandler = async (req, res) => {
    const { email, name, password, role = "pengguna" } = req.body;

    const getUserRecord = await getUserByEmail(email);

    if (getUserRecord !== null) {
        res.status(400).json({ message: 'User already exists' });
    } else {
        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            const userRecord = await registerUser(name, email, hash, role);
            res.status(200).json({ message: 'User registered successfully', data: userRecord });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

const getUsersHandler = async (req, res) => {
    try {
        const users = await getUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error getting users", error: error.message });
    }
};

const getUserByIdHandler = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error getting user", error: error.message });
    }
};

const updateProfileHandler = async (req, res) => {
    const { userId } = req.params;
    const { name, gender, age } = req.body;
    let profilePictureUrl = null;

    try {
        // Get the current user data from Firestore
        const userRef = firestore.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }
        const currentUserData = userDoc.data();

        // Check if a new profile picture is being uploaded
        if (req.file) {
            // Construct the filename for the new profile picture
            const fileExtension = req.file.originalname.split('.').pop(); // Get the file extension
            const newProfilePictureFileName = `${userId}_${req.file.originalname}.${fileExtension}`; // Example: abcdef_profile.jpg

            // Check if there's an existing profile picture for the user
            if (currentUserData.profilePictureUrl) {
                // Extract the filename of the old profile picture
                const oldProfilePictureFileName = currentUserData.profilePictureUrl.split('/').pop();
                // Delete the existing profile picture if it matches the pattern
                if (oldProfilePictureFileName.startsWith(`${userId}_`)) {
                    const oldProfilePicture = bucket.file(`profile_pictures/${oldProfilePictureFileName}`);
                    await oldProfilePicture.delete();
                    console.log(`Deleted old profile picture: ${oldProfilePictureFileName}`);
                }
            }

            // Upload the new profile picture
            const blob = bucket.file(`profile_pictures/${newProfilePictureFileName}`);
            const blobStream = blob.createWriteStream({
                resumable: false,
                metadata: {
                    contentType: req.file.mimetype,
                },
            });

            blobStream.on('error', (err) => {
                console.error('Error uploading file:', err);
                return res.status(500).json({ message: 'Error uploading file', error: err.message });
            });

            blobStream.on('finish', async () => {
                profilePictureUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                console.log(`Uploaded new profile picture: ${profilePictureUrl}`);

                // Update the user profile data in Firestore with the new profile picture URL
                const updatedUser = await updateProfile(userId, { name, gender, age, profilePictureUrl });
                return res.status(200).json({ message: 'User profile updated successfully', data: updatedUser });
            });

            blobStream.end(req.file.buffer);
        } else {
            // If no file is uploaded, only update the provided data
            const updatedUser = await updateProfile(userId, { name, gender, age });
            res.status(200).json({ message: 'User profile updated successfully', data: updatedUser });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).json({ message: error.message });
    }
};


const logoutHandler = async (req, res) => {
    const refreshToken = req.cookies.token;

    try {
        const userRecord = await getUserByToken(refreshToken);

        if (userRecord.empty) {
            throw new Error('User not found');
        }
        const userId = userRecord.docs[0].id;
        await updateToken(userId, null);
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Middleware untuk menangani unggahan file
const uploadProfilePicture = upload.single('profilePicture');

const { getPredictionsByUserId } = require("../models/user");

const getPredictionsByUserIdHandler = async (req, res) => {
    const { userId } = req.params;

    try {
        const predictions = await getPredictionsByUserId(userId);
        res.status(200).json({ message: 'Predictions retrieved successfully', data: predictions });
    } catch (error) {
        res.status(500).json({ message: "Error getting predictions", error: error.message });
    }
};

module.exports = { getUsersHandler, registerUserHandler, loginHandler, updateProfileHandler, getUserByIdHandler, logoutHandler, uploadProfilePicture, getPredictionsByUserIdHandler };


// module.exports = { getUsersHandler, registerUserHandler, loginHandler, updateProfileHandler, getUserByIdHandler, logoutHandler, uploadProfilePicture };
