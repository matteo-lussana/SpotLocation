from crypt import methods
from flask import Flask, request

import mysql.connector

import json

app = Flask(__name__)

db_config =  {
    'host': 'localhost',
    'user': 'root',
    'password': 'password',
    'database': 'spotlocation'
}

def inserisci_posizioni(dati_posizioni):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        insert_query = "INSERT INTO posizioni (lat, lng, alt, timestamp, name, ctg, img) VALUES (%s, %s, %s, %s, %s, %s, %s)"
        data_to_insert = (dati_posizioni['lat'], dati_posizioni['lng'], dati_posizioni['alt'], dati_posizioni['timestamp'], dati_posizioni['name'], dati_posizioni['ctg'], dati_posizioni['img'])
        cursor.execute(insert_query, data_to_insert)
        conn.commit()

        cursor.close()
        conn.close()

        return True

    except mysql.connector.Error as err:
        print("errore durante l'inserimento dei dati nel database", err)
        return False

@app.route('/posizioni', methods=['POST'])
def ricevi_posizioni():
    try:
        dati_posizioni = request.get_json()

        if dati_posizioni is not None:
            if inserisci_posizioni(dati_posizioni):
                return 'dati ricevuti e savati con successo'
            else:
                return 'errore nel salvataggio dei dati'
        else: 
            return 'dati mancanti o formato JSON non corretto'
    except Exception as e:
        print("errore durante la ricezione delle posizioni", e)
        return 'errore inderno del server.', 500

@app.route('/posizioni', methods=['GET'])
def ricevi_posizioni():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        select_query = "SELECT * FROM spot"
        cursor.execute(select_query)
        dati_posizioni = cursor.fetchall()
        
        cursor.close()
        conn.close()

        return json.dumps(dati_posizioni)
    except mysql.connector.Error as err:
        print("errore durante la lettura dei dati dal database", err)
        return 'errore nel recupero dei dati'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port = 5000)