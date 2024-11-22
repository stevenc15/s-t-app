from utils import read_video, save_video
from trackers import Tracker
import cv2
from team_assigner import Team_assigner
from player_ball_assignment import PlayerBallAssigner

from camera_movement_estimator import Camera_Movement_Estimator
from view_transformer import View_Transformer
import numpy as np
from speed_distance_estimator import SpeedDistanceEstimator
import sys
import os
from pathlib import Path

def process_video(inputP, outputP):
    #read video
    video_frames = read_video(inputP)
    
    #Initialize tracker

    # Absolute path to the Python script
    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models/best.pt'))
    trackerv1 = Tracker(model_path)
    
    track_s_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'stubs/tracks_stubs.pkl'))
    #track objects
    tracks = trackerv1.get_object_tracks(video_frames, read_from_stub=False, stub_path=track_s_path)
        
    #get object positions
    trackerv1.add_position_to_tracks(tracks)
    
    #camera movement
    camera_movement_estimator = Camera_Movement_Estimator(video_frames[0])
    track_c_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'stubs/camera_movement_stub.pkl'))
    camera_movement_per_frame=camera_movement_estimator.get_camera_movement(video_frames, read_from_stub=True, stub_path= track_c_path)
    camera_movement_estimator.adjust_positions_to_tracks(tracks, camera_movement_per_frame)
    
    
    #view transformer
    view_transformer = View_Transformer()
    view_transformer.add_transformed_position_to_tracks(tracks)
    
    #interpolate ball positions
    tracks['ball']= trackerv1.interpolate_ball_positions(tracks['ball'])
    
    #speed and distance estimator
    speed_distance_estimator = SpeedDistanceEstimator()
    speed_distance_estimator.add_speed_and_distance_to_tracks(tracks)
    #assign player teams
    team_assigner = Team_assigner() 
    
    team_assigner.assign_team_color(video_frames[0], tracks['players'][0])
    
    for frame_num, player_track in enumerate(tracks['players']):
        for player_id, track in player_track.items():
            team=team_assigner.assign_player_to_team(video_frames[frame_num],
                                               track['bbox'],
                                               player_id)
            
            tracks['players'][frame_num][player_id]['team']=team
            tracks['players'][frame_num][player_id]['team_color']=team_assigner.team_colors[team]
    
    #assign ball acquisition    
    player_ball_assigner= PlayerBallAssigner()
    team_ball_control=[]
    
    for frame_num, player_track in enumerate(tracks['players']):
        ball_bbox=tracks['ball'][frame_num][1]['bbox']
        assigned_player = player_ball_assigner.assign_ball_to_player(player_track, ball_bbox)
        #print(assigned_player)
        if assigned_player!=-1:
            #print("sos")
            tracks['players'][frame_num][assigned_player]['has_ball']=True
            team_ball_control.append(tracks['players'][frame_num][assigned_player]['team'])
        else:
            team_ball_control.append(team_ball_control[-1])
            
    
    team_ball_control=np.array(team_ball_control)
    #draw annotations
    output_video_frames = trackerv1.draw_annot(video_frames, tracks, team_ball_control)
    
    #draw camera movement
    output_video_frames=camera_movement_estimator.draw_camera_movement(output_video_frames, camera_movement_per_frame)
    
    #draw speed and distance
    speed_distance_estimator.draw_speed_and_distance(output_video_frames, tracks) 
    
    if (output_video_frames is not None):
        print("output frames created")
    
    print("output path:", outputP)
    
    #save video elsewhere, not to overwrite original video
    save_video(output_video_frames, outputP)
    
if __name__ == '__main__':
    inputP=sys.argv[1]
    
    outputP=sys.argv[2]
    process_video(inputP, outputP)
    