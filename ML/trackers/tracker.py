from ultralytics import YOLO
import supervision as sv
import pickle
import os
import numpy as np
import sys
import pandas as pd
sys.path.append('../')
from utils import get_center_of_bbox, get_bbox_width, get_foot_position
import cv2
import time
import json

class Tracker ():
    def __init__(self, model_path):
        self.model=YOLO(model_path)
        self.tracker=sv.ByteTrack()

    def add_position_to_tracks(self, tracks):
        for object, object_tracks in tracks.items():
            for frame_num, track in enumerate(object_tracks):
                for track_id, track_info in track.items():
                    bbox = track_info['bbox']
                    if object == 'ball':
                        position=get_center_of_bbox(bbox)
                        
                    else:
                        position=get_foot_position(bbox)
                    tracks[object][frame_num][track_id]['position']=position
    def interpolate_ball_positions(self, ball_positions):
        ball_positions = [x.get(1, {}).get('bbox', []) for x in ball_positions]
        
        df_ball_positions=pd.DataFrame(ball_positions, columns=['x1', 'x2', 'y1', 'y2'])
        
        #interpolate ball positions
        df_ball_positions = df_ball_positions.interpolate()
        df_ball_positions = df_ball_positions.bfill()
        
        ball_positions =[{1:{"bbox":x}}for x in df_ball_positions.to_numpy().tolist()]
        
        return ball_positions
    
    #detect frames works perfectly
    def detect_frames(self, frames):
        batch_size = 20
        
        detections = []
        
        for i in range(0, len(frames), batch_size):
            #.track instead of .predict would provide track ids, but first we are going 
            #to overwrite the keeper with the player so let us do .predict
                detections_batch=self.model.predict(frames[i:i+batch_size], conf = 0.1)
                detections+=detections_batch
        
        return detections
        
    #el problema no esta en este function
    def get_object_tracks(self, frames, read_from_stub =False, stub_path=None):
        
        #checks if tracks have already been made
        if read_from_stub==True & os.path.exists(stub_path): 
            with open(stub_path, 'rb') as f:
                tracks=pickle.load(f)
            return tracks 
        
        #detect frames 
        detections = self.detect_frames(frames)       
    
        tracks = {
            "players":[],
            "referees":[],
            "ball":[]
        }
        #######################################Good
        #detections[0] = first frame, len(detections[0])= n of detections in the first frame
        #len(detections) = number of frames detected for 
        #detections[0][0].boxes = bbox de el primer detection de el primer frame
        #print(len(detections))
                
        for frame_num, detection in enumerate(detections):
            
            #print("#########################################")
           
            #format = {0:player, 1:goalkeeper}
            cls_names = detection.names
            #here we switch the id number with the descriptor {player:0, goalkeeper:1}
            cls_names_inverse = {value:key for key, value in cls_names.items()}
    
                
            #convert detection to supervision detection format
            detection_supervision = sv.Detections.from_ultralytics(detection)
            
            #print(len( detection_supervision))
            #change goalkeeper to player
            for object_ind, class_id in enumerate(detection_supervision.class_id):
                if cls_names[class_id]=="goalkeeper":
                    detection_supervision.class_id[object_ind] = cls_names_inverse["player"]
                    
            #track_objects
            detections_with_tracks= self.tracker.update_with_detections(detection_supervision)
                
            tracks["players"].append({})
            tracks["referees"].append({})
            tracks["ball"].append({})
            
            for frame_detection in detections_with_tracks:
                #print('--------------------with_tracks')
                bbox = frame_detection[0].tolist()
                cls_id = frame_detection[3]
                track_id = frame_detection[4]
                     
                if cls_id == cls_names_inverse['player']:
                    tracks["players"][frame_num][track_id] = {"bbox": bbox}
                    #print("player")
                    
                if cls_id == cls_names_inverse['referee']:
                    tracks["referees"][frame_num][track_id] = {"bbox": bbox}
                    #print("ref")   
                
            for frame_detection in detection_supervision:
                #print('------------------------_supervision')
                bbox = frame_detection[0].tolist()
                cls_id = frame_detection[3]
                #track_id = frame_detection[4]

                if cls_id == cls_names_inverse['ball']:
                    tracks["ball"][frame_num][1] = {"bbox": bbox}
                    #print("ball")  
                    
            ##############################print(detections_with_tracks) 
            
        if stub_path != None:
            with open(stub_path, 'wb') as f:
                pickle.dump(tracks, f)
          
        return tracks    
    
    def draw_ellipse(self, frame, bbox, color, track_id=None):
         
        y2 = int(bbox[3])
        x_center, y_center = get_center_of_bbox(bbox)
         
        width = get_bbox_width(bbox)
         
        cv2.ellipse(frame, center = (x_center, y2), axes= (int(width), 
                int(width*.35)), angle=0.0, startAngle=45, endAngle=235, color=color, thickness=2, 
                lineType=cv2.LINE_4)
         
         
        rectangle_width=40
        rectangle_height=20
        x1_rect=x_center-rectangle_width//2
        x2_rect=x_center+rectangle_width//2
        y1_rect=(y2-rectangle_height//2)+15
        y2_rect=(y2+rectangle_height//2)+15
        
        if track_id != None:
            cv2.rectangle(frame, (int(x1_rect), int(y1_rect)), (int(x2_rect), int(y2_rect)), color, cv2.FILLED)
            
            x1_text=x1_rect+12
            if track_id > 99:
                x1_text=-10
            
            cv2.putText(frame, f"{track_id}", (int(x1_text), int(y1_rect+15)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,0), thickness=2)
        
        
            
        return frame
         
    def draw_triangle(self, frame, bbox, color):
        y=int(bbox[1])
        x,_ = get_center_of_bbox(bbox)
        
        triangle_points= np.array([
            [x,y],
            [x-10, y-20],
            [x+10, y-20]
        ])
        
        cv2.drawContours(frame, [triangle_points], 0, color, cv2.FILLED)
        cv2.drawContours(frame, [triangle_points], 0, (0,0,0), 2)
        
        return frame
        
    def draw_team_ball_control(self, frame, frame_num, team_ball_control):
        #draw semi transparent rectangle
        overlay = frame.copy()
        
        cv2.rectangle(overlay, (1350, 850), (1900, 970), (255, 255, 255), -1)
        alpha=0.4
        cv2.addWeighted(overlay, alpha, frame, 1-alpha, 0, frame)
        
        team_ball_control_till_frame = team_ball_control[:frame_num+1]
        #get ball control for each team, num times each team has ball
        team_1_num_frames=team_ball_control_till_frame[team_ball_control_till_frame==1].shape[0]
        team_2_num_frames=team_ball_control_till_frame[team_ball_control_till_frame==2].shape[0]        
        
        team_1=team_1_num_frames/(team_1_num_frames+team_2_num_frames)
        team_2=team_2_num_frames/(team_1_num_frames+team_2_num_frames)
        
        cv2.putText(frame, f"Team 1 Ball Control: {team_1*100:.2f}%", (1400, 900), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,0), 3)
        cv2.putText(frame, f"Team 2 Ball Control: {team_2*100:.2f}%", (1400, 950), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,0), 3)
        
        return frame
        
    def draw_annot(self, video_frames, tracks, team_ball_control):
        output_video_frames = []
        for frame_num, frame in enumerate(video_frames):
                      
            frame=frame.copy()    
            
            player_dict = tracks["players"][frame_num]
            referee_dict = tracks["referees"][frame_num]
            ball_dict = tracks["ball"][frame_num]  
            
            for track_id, player in player_dict.items():
                color=player.get("team_color", (0, 0, 255))
                frame=self.draw_ellipse(frame, player["bbox"], color, track_id)
                
                if player.get('has_ball', False):
                    frame = self.draw_triangle(frame, player["bbox"], (0, 0, 255))
                
            for _, referee in referee_dict.items():
                frame=self.draw_ellipse(frame, referee["bbox"], (0, 255, 255))
                
                
            #draw ball
            for track_id, ball in ball_dict.items():
                frame=self.draw_triangle(frame, ball["bbox"], (0,255, 0))
                
            #draw team ball control
            frame = self.draw_team_ball_control(frame, frame_num, team_ball_control)
            
            #progress = (frame+1)/(len(video_frames)*100)
            #message = json.dumps({'progress': progress})
            
            #print (message)
            
            #sys.stdout.flush()
            output_video_frames.append(frame)
            
        return output_video_frames