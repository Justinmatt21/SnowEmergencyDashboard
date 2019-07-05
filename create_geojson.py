METROCOUNTIES = ['HENNEPIN', 'RAMSEY', 'ANOKA', 'CARVER', 'DAKOTA', 'SCOTT', 'WRIGHT', 'SHERBURNE', 'ISANTI',\
                'WASHINGTON', 'CHISAGO']

def filter_by_dates(df, start_date, end_date, counties=METROCOUNTIES):
    """For each station, return the cumulative snowfall from start_date to end_date, inclusive"""
    
    number_of_days = (end_date - start_date).days + 1 # since inclusive
    
    range_of_days = [start_date + datetime.timedelta(days=day) for day in range(number_of_days)]
    
    time_cond = df['date'].isin(range_of_days)
    
    county_cond = df['county'].isin(counties)
    
    combined_cond = time_cond & county_cond
    
    return df[combined_cond]

def group_and_summarize_dataframe (df, grouping, stats):
    """Compute summary quantities for a pandas dataframe after grouping.
    
    Args:
        df: A pandas dataframe
        grouping: A column name or a list of column names to group
            the dataframe with.
        stats: A list of tuples. Each tuple is of the form:
            
            (name, column, function)
        
        where `name` is the desired output name for the summary quantity,
        `column` is the target column of the data frame, and `function` is 
        the function used to compute the summary.
        
    Returns:
        A pandas dataframe with the output summaries.
        
    Raises:
        None.  At this time, there is no error checking for the input parameters.
    """
        
    # Create an empty dataframe to store the results.
    results_df = pd.DataFrame()
    
    grouped_df = df.groupby(grouping)
    
    for name, column, agg_func in stats:
        results_df[name] = grouped_df[column].agg(agg_func)
        
    return results_df.reset_index()

def metro_snowtotals_by_dates(df, start_date, end_date):
    
    filtered_df = filter_by_dates(df, start_date, end_date)
    
    total_df = group_and_summarize_dataframe(filtered_df, 'station',\
                                           [('name', 'name', lambda x: x.unique()),\
                                            ('county', 'county', lambda x: x.unique()),\
                                            ('longitude', 'longitude', lambda x: x.unique()),\
                                            ('latitude', 'latitude',  lambda x: x.unique()),\
                                            ('snowtotal', 'snowfall', 'sum')])
    return total_df

""" def lookup_snowtotals_by_emergency(snow_df, name):
    
    emergencies_df = pd.read_csv("episodes.csv")
    
    emergency_df = emergencies_df[emergencies_df.emergency == name]
    
    start_date = emergency_df.storm_begin_date.tolist()[0]
    end_date  = emergency_df.declaration_date.tolist()[0]
    
    start_date = parse(start_date)
    end_date = parse(end_date)
    
    snow_amounts_df = metro_snowtotals_by_dates(snow_df, start_date, end_date)
    
    return snow_amounts_df
 """
# The code below was not mine - the source is given below
# https://geoffboeing.com/2015/10/exporting-python-data-geojson/

import geojson

def df_to_geojson(df, properties, lat='latitude', lon='longitude'):
    geojson = {'type':'FeatureCollection', 'features':[]}
    for _, row in df.iterrows():
        feature = {'type':'Feature',
                   'properties':{},
                   'geometry':{'type':'Point',
                               'coordinates':[]}}
        feature['geometry']['coordinates'] = [row[lon],row[lat]]
        for prop in properties:
            feature['properties'][prop] = row[prop]
        geojson['features'].append(feature)
    return geojson

""" def get_snowfall_geojson_by_emergency(snow_emergency):
    
    return df_to_geojson(lookup_snowtotals_by_emergency(all_amounts_df, snow_emegency),\
                         ['station', 'name', 'snowtotal'])
 """
