import os
import pandas as pd
import pymongo
import dns
import json
from bson.objectid import ObjectId
import sys

print(sys.argv[1])
# DB connection
client = pymongo.MongoClient(
    "mongodb+srv://main:se4450@main-ia8yw.mongodb.net/test?retryWrites=true")
db = client.Main

clients = db.clients

# Retrieve current working directory (`cwd`)
cwd = os.getcwd()
cwd

# Change directory
# os.chdir("./invoices")

# List all files and directories in current directory
# os.listdir('.')

# print(os.getcwd())

# Assign spreadsheet filename to `file`
file = sys.argv[1]

# Load spreadsheet
xl = pd.ExcelFile(file)

# Print the sheet names
# print(xl.sheet_names)

# Load a sheet into a DataFrame by name: invoice_data
invoice_data = xl.parse('Sheet1')
invoice_data['Discount'].fillna(0, inplace=True)

location_address = invoice_data['Location Address'].unique()[0].upper()
location_city = invoice_data['Location City'].unique()[0]
location_province = invoice_data['Location Province'].unique()[0]
location_pc = invoice_data['Location PC'].unique()[0]
location_complete = location_address + ', ' + location_city + \
    ', ' + location_province + ' ' + location_pc
location_complete = location_complete.upper()

c = clients.find_one({"address": location_complete})

invoices = []

for index, row in invoice_data.iterrows():
    call_id = str(row['Call Id'])
    invoice_date = str(row['Inv Date'])
    quantity = row['Qty']
    item_code = row['Item Code']
    description = row['Item Description']
    discount = row['Discount']
    amount_after_discount = row['Amount After Discount']
    tech = row['Tech']

    data = {
        "_id": ObjectId(),
        "date": invoice_date,
        "quantity": quantity,
        "itemCode": item_code,
        "description": description,
        "discount": discount,
        "amountAfterDiscount": amount_after_discount,
        "tech": tech
    }
    invoices.append(data)

callIndex = -1
for i in range(0, len(c['calls'])):
    if c['calls'][i]['callId'] == call_id:
        c['calls'][i]['status'] = "completed"
        c['calls'][i]['worker'] = ""
        c['calls'][i]['invoice'] = invoices
        callIndex = i
        break

if callIndex >= 0:
    clients.update_one({'_id': c['_id']}, {
                       '$set': {'calls': c['calls']}}, upsert=False)
    print("Added invoice(s) to " + c['firstName'] + " " + c['lastName'])
