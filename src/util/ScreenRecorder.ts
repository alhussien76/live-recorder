import * as RecordRTC from "recordrtc";
import { Subject, merge, fromEvent, Observable, from } from "rxjs";
import { take } from "rxjs/operators";
declare var navigator: any;

export class ScreenRecorder {
    public bolb$ = new Subject<Blob>();
    private recorder: RecordRTC;
    constructor() { }
  
    public startRecording(): void{
      this.getDisplayMedia().subscribe(stream => {
        merge(
          fromEvent(stream, 'ended'),
          fromEvent(stream, 'inactive'),
          ...stream.getTracks().map(track => fromEvent(track, 'ended')),
          ...stream.getTracks().map(track => fromEvent(track, 'inactive'))
        ).pipe(take(1)).subscribe(() => {
          this.stopRecording();
        });
        this.recorder = new RecordRTC(stream, {
          type: 'video'
        });
        this.recorder.startRecording();
      });
    }
  
    public stopRecording(): void {
        this.recorder.stopRecording(() => {
          this.bolb$.next(this.recorder.getBlob());
          this.bolb$.complete();
        });
    }
  
    private getDisplayMedia(): Observable<MediaStream> {
      const displayMediaStreamConstraints: MediaStreamConstraints = {
        video: true,
        audio: true
      };
      if (navigator.mediaDevices.getDisplayMedia) {
        return from(navigator.mediaDevices.getDisplayMedia(displayMediaStreamConstraints) as Promise<MediaStream>);
      }
      else {
        return from(navigator.getDisplayMedia(displayMediaStreamConstraints) as Promise<MediaStream>);
      }
    }
  
    public dispose(): void { 
        this.recorder.destroy();
    }
  
  }