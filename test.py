import sys
import pandas as pd

#%%
year = sys.argv[1] or '2004-04-22'
genre = sys.argv[2] or 'Documentary'
#%%

datafile = pd.read_csv('data/mergedbudget_rev.csv')
datafile.head()


#%%
filtered = datafile[(datafile['startYear'] == '2004-04-22') & (datafile['genres'].apply(lambda x: x.lower()).str.contains(('Documentary').lower()))]

filtered.head()
#%%
sys.stdout.flush()

#%%
filtered.shape


#%%
filtered.groupby('tconst')['originalTitle'].agg('first')

#%%
print(filtered.head(150))