#%%
from obspy import read, Stream
import os
from matplotlib import pyplot as plt
import glob
# streams = [read(file) for file in glob.glob('**/*.mseed', recursive=True)]
# # for file in glob.glob('**/*.mseed', recursive=True):
# #     st = read(file)
# #     print(st)
# #     st.plot()
# #     plt.show()
# # # st = read(file)
# for stream in streams[1:]:
#     streams[0].extend(stream)
#     streams[0].plot()
# # print(streams[0].extend(streams)
# # st.plot()\

def read_merge_trim():
    dat_dir = '/202/'
    tce_dir = '/202/PROCESSED/'
    if not os.path.exists(tce_dir):
        os.makedirs(tce_dir)

    st = Stream()
    file_list = []
    for path, subdirs, files in os.walk(dat_dir):
        for name in files:
            if name.endswith('.msd'):
                print(os.path.join(path, name))
                file_list.append(os.path.join(path, name))
    for file in file_list:
        st += read(file)

    st.sort(['starttime'])
    print('Merging traces...')
    st.merge(method=1, fill_value=0)
    print('done')

read_merge_trim()