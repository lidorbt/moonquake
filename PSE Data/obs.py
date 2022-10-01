#%%
from socketserver import ForkingUDPServer
import obspy
import obspy.signal.filter as filter
import numpy as np
import os
from matplotlib import pyplot as plt
import scipy.signal as ss
import glob

folder = '/home/phononia/moon_quake/pds-geosciences.wustl.edu/lunar/urn-nasa-pds-apollo_pse/data/xa/continuous_waveform/s16/1972/'

START = 10
FINISH = 20
OFFSET = 500
RESOLUTION = 20000

def norm(trace, resolution) -> np.ndarray:
    # Gets the norm of a trace
    return [np.abs(np.average(chunk) - OFFSET) for chunk in np.array_split(clean_data(trace.data), trace.stats.npts // resolution, axis=0)]

def get_trace(stream):
    # Gets the trace from a stream
    return stream[0]

def get_trace_data(stream):
    # Gets the data from a trace
    return get_trace(stream).data

def clean_data(data):
    # Cleans the data by removing the offset
    mask = np.abs(data) > 1
    return data[mask]

def get_trace_norm(stream, resolution=4000):
    # Gets the norm of a trace
    return norm(get_trace(stream), resolution)

def get_all_channel_files(files, channel):
    # Gets all the files for a given channel from the given folder
    mseed_files = glob.glob(f'{folder}/**/*.mseed', recursive=True)
    return sorted([file for file in mseed_files if channel in file])

def get_all_channel_norms(folder, channel, resolution=4000):
    # Gets all the norms for a given channel from the given folder
    array = []
    for file in get_all_channel_files(folder, channel)[START:FINISH]:
        stream = obspy.read(file)
        array.extend(get_trace_norm(stream, resolution=resolution))
    return array

def files_to_json(folder):
