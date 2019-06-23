# #%%
import sys
import pandas as pd
import datetime
from datetime import timedelta
import json

# #%%
year = sys.argv[1] 
genre = sys.argv[2]

datafile = pd.read_csv('data/dataregion.csv')


# #%%
# datafile['startYearEdited'] = datafile[datafile['startYear'].notna()]['startYear'].apply(lambda x: datetime.datetime.strptime(x, '%Y-%m-%d'))
# #%%
# # year = '2004-04-22'
# # genre = 'Documentary'
filtered = datafile[(datafile['startYearEdited'].notna()) &
                    (datafile['numVotes'].notna()) &
                    (datafile['averageRating'].notna()) &
                    (datafile['originalTitle'].notna()) &
                    (datafile['originalTitle'].str.isalnum()) &
                    # (datafile['originalTitle'].str.match(r"^ ?(\w*[-_) (!#$&]*)+$")) &
                    (datafile['profit'].notna()) &
                    # (datafile['profit'] > 0) &
                    (datafile['moviescore'].notna()) &
                    (datafile['genres'].notna()) &
                    (datafile['startYearEdited'] >= datetime.datetime.strptime(year, '%Y-%m-%d')) & 
                    (datafile['startYearEdited'] < datetime.datetime.strptime(year, '%Y-%m-%d') + timedelta(days=3700)) & 
                    (datafile['genres'].apply(lambda x: x.lower()) == genre.lower())
                    ]
filtered = filtered.sort_values('moviescore', ascending=False)


# #%%

filtered = filtered[:200]



mylist = []
for row in filtered.iterrows():
    r = row[1]
    mylist.append({
        'tconst': r['tconst'],
        'startYear': r['startYear'],
        'numVotes': r['numVotes'],
        'averageRating': r['averageRating'],
        'profit': r['profit'],
        'originalTitle': r['originalTitle'],
        'genres': r['genres'],
        'moviescore': r['moviescore']
    })
print(json.dumps(mylist))
# #%%
