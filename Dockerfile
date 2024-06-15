    FROM python:3.10.2

    WORKDIR /app

    COPY . .

    COPY ./requirements.txt /code/requirements.txt

    RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

    EXPOSE 8080

    CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]