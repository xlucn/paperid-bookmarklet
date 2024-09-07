import re
import requests
from urllib.parse import urlencode

pattern = re.compile(r"(\D+)(\d{4})\D+(\d+)\.\d+")

def get_query(code):
    author, year, vol = pattern.match(code).groups()
    return {
        "q": f"first_author:{author} year:{year} volume:{vol}",
        "fl": "title,author,year,volume,page,doi,bibstem",
        "rows": 10
    }

def search(code):
    query = get_query(code)
    encoded_query = urlencode(query)
    token = "4dWCW8TK3PA0rZaVP8Bxqhm6S1MRPDD7x63F4tsc"
    url = "https://api.adsabs.harvard.edu/v1/search/query?{}".format(encoded_query)
    results = requests.get(url, headers={'Authorization': 'Bearer ' + token})
    for i in results.json()['response']['docs']:
        if i.get('doi'):
            print("{}: doi.org/{}, {}, {}".format(code, i['doi'][0], i['bibstem'], i['page']))
        else:
            print("{}: {}, {}, {}".format(code, i['title'][0], i['bibstem'], i['page']))

for line in open("journals.txt"):
    search(line.strip())
