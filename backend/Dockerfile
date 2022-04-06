FROM python:3.10-slim

WORKDIR /code

EXPOSE 80

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app

CMD [ "uvicorn", "app.api:app", "--proxy-headers", "--root-path", "/api/v1", "--host", "0.0.0.0", "--port", "80", "--log-level", "critical" ]
