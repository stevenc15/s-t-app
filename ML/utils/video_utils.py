#utilities to read in the video and save the video

import cv2

#returns list of frames for a video
def read_video(video_path):
    v_cap = cv2.VideoCapture(video_path)
    frames = []
    while True:
        v_cont, frame = v_cap.read() 
        if not v_cont:
            break
        frames.append(frame)
    return frames


#saves processed video
def save_video (out_video_frames, out_video_path):
    print(f"Saving video to {out_video_path}")
    output_format = cv2.VideoWriter_fourcc(*'mp4v') #'XVID'
    frame_width = out_video_frames[0].shape[1]
    frame_height = out_video_frames[0].shape[0]
    out = cv2.VideoWriter(out_video_path, output_format, 24, (frame_width, frame_height))
    for frame in out_video_frames:
        out.write(frame)
    out.release()