#%%
import obspy
import numpy as np
import os
import json
from tqdm import tqdm
from matplotlib import pyplot as plt
import glob

folder = '/home/phononia/moon_quake/pds-geosciences.wustl.edu/lunar/urn-nasa-pds-apollo_pse/data/xa/continuous_waveform/s12/1972'

START = None
FINISH = None
OFFSET = 500
RESOLUTION = 100

def save_json(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f)

def day_thread(day_folder):
    return process_day_stream(merge_stream(day_folder))

def json_by_year(folder):
    year_data = {}
    [year_data.update(process_day_stream(merge_stream(day_folder))) for day_folder in tqdm(sorted(glob.glob(f'{folder}/*/'))[START:FINISH])]

    plt.figure(figsize=(20, 10), dpi=200)
    plt.plot(year_data.values())
    plt.show()

    with open(f'{folder.split("/")[-2]}.json', 'w') as f:
        json.dump(year_data, f)

def merge_stream(folder):
    stream = obspy.Stream()
    for file in glob.glob(f'{folder}/*.mseed'):
        stream += obspy.read(file)
    return stream

def process_day_stream(stream):
    day_data = {}

    att_trace = stream.select(channel='ATT')[0]
    norm_att_trace = norm(att_trace, resolution=RESOLUTION)

    channels = [norm(stream.select(channel=channel)[0], RESOLUTION) for channel in ['MH1', 'MH2', 'MHZ']]

    channels = [np.round(np.average(channels, axis=0), 3), channels[2]]

    start_time = att_trace.stats.starttime
    end_time = att_trace.stats.endtime
    add_time = (end_time - start_time) / len(norm_att_trace)

    for index in range(len(norm_att_trace)):
        day_data[str(start_time + add_time * index)] =  [channel[index] for channel in channels]
    
    return day_data

def norm(trace, resolution) -> np.ndarray:
    # Gets the norm of a trace
    return [round((np.abs(np.average(chunk) - OFFSET)), 3) for chunk in np.array_split(clean_data(trace.data), trace.stats.npts // resolution, axis=0)]

def clean_data(data):
    # Cleans the data by removing the offset
    mask = np.abs(data) > 1
    return data[mask]

json_by_year(folder)