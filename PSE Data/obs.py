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

# streams = [obspy.read(file) for file in glob.glob(f'{folder}/**/*.mseed', recursive=True)]
START = 10
FINISH = 100
OFFSET = 500

def norm(trace, resolution) -> np.ndarray:
    return [np.abs(np.average(chunk) - OFFSET) for chunk in np.array_split(clean_data(trace.data), trace.stats.npts // resolution, axis=0)]

def get_trace(stream):
    return stream[0]

def get_trace_data(stream):
    return get_trace(stream).data

def clean_data(data):
    mask = np.abs(data) > 1
    return data[mask]

def get_trace_norm(stream, resolution=4000):
    return norm(get_trace(stream), resolution)

def get_all_channel_files(files, channel):
    mseed_files = glob.glob(f'{folder}/**/*.mseed', recursive=True)
    return sorted([file for file in mseed_files if channel in file])

def get_all_channel_norms(folder, channel, resolution=4000):
    array = []
    for file in get_all_channel_files(folder, channel)[START:FINISH]:
        stream = obspy.read(file)
        array.extend(get_trace_norm(stream, resolution=resolution))
    return array

resolution = 20000
Figure = plt.figure(figsize=(20, 10), dpi=100)
plt.plot(get_all_channel_norms(folder, 'mh1', resolution=resolution))
plt.plot(get_all_channel_norms(folder, 'mh2', resolution=resolution))
plt.plot(get_all_channel_norms(folder, 'mhz', resolution=resolution))
plt.show()

# #print(streams[0].plot())

# #signal = obspy.signal.filter.highpass(streams[0][0].data, 0.01, 100, True)
# stream = streams[3][0]
# # print(stream.get_gaps())
# mask = np.abs(stream.data) > 1
# data = stream.data[mask]
# stream.data = data
# print(stream.stats)
# # f, Pxx_den = ss.welch(stream.data, stream.stats.sampling_rate, nperseg=1024)
# # print(Pxx_den)
# # plt.plot(Pxx_den)
# stream.plot()
# plt.show()
# # plt.semilogy(f, Pxx_den)
# # plt.semilogy(*)
# norm = 
# plt.plot(norm)

# print([for i in range(len()//4000)])
    
# print()
# stream.plot()

# stream.data = clean_data(get_trace_data(stream, 'MH1'))[300000:400000]
# stream.spectrogram(wlen=10, log=True, title='Spectrogram', show=True)
# print(filter.highpass(stream.data, 0.01, 100, True))
# plt.plot(filter.lowpass(stream.data[:4000], freq=1, df=0.1, corners=1, zerophase=True))
# signal = stream.data
# print(signal)
# mask = np.abs(signal) > 1
# data = signal[mask]
# plt.plot(data[:4000])
# print(signal.shape)


# plt.plot(signal[:2000])
# for file in glob.glob('**/*.mseed', recursive=True):
#     st = read(file)
#     print(st)
#     st.plot()
#     plt.show()
# # st = read(file)
# for stream in streams[1:]:
#     streams[0].extend(stream)
#     streams[0].plot()
# print(streams[0].extend(streams)
# st.plot()\

# def read_merge_trim():
#     dat_dir = '/202/'
#     tce_dir = '/202/PROCESSED/'
#     if not os.path.exists(tce_dir):
#         os.makedirs(tce_dir)

#     st = Stream()
#     file_list = []
#     for path, subdirs, files in os.walk(dat_dir):
#         for name in files:
#             if name.endswith('.msd'):
#                 print(os.path.join(path, name))
#                 file_list.append(os.path.join(path, name))
#     for file in file_list:
#         st += read(file)

#     st.sort(['starttime'])
#     print('Merging traces...')
#     st.merge(method=1, fill_value=0)
#     print('done')

# read_merge_trim()
# %%
