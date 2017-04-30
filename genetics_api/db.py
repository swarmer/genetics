import os

import psycopg2


HOSTNAME = os.environ['DB_HOSTNAME']
USERNAME = os.environ['DB_USERNAME']
PASSWORD = os.environ['DB_PASSWORD']
DBNAME = os.environ['DB_NAME']


def connect():
    return psycopg2.connect(host=HOSTNAME, dbname=DBNAME, user=USERNAME, password=PASSWORD)
