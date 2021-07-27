import * as RecordRTC from "recordrtc";
import { Subject, merge, fromEvent, Observable, from } from "rxjs";
import { take } from "rxjs/operators";
import { isEdge } from "./browser-type";
declare var navigator: any;

export class ScreenRecorder {

  public bolb$ = new Subject<Blob>();
  private recorder: RecordRTC;
  constructor() { }

  public startRecording(): void {
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
    const screenStreamConstraints: MediaStreamConstraints = {
      audio: false,
      video: true
    };
    const audioStreamConstraints: MediaStreamConstraints = {
      audio: true
    };
    if (navigator.mediaDevices.getDisplayMedia) {
      return from(Promise.all([
        navigator.mediaDevices.getDisplayMedia(screenStreamConstraints) as Promise<MediaStream>,
        navigator.mediaDevices.getUserMedia(audioStreamConstraints) as Promise<MediaStream>
      ]).then(([screenStream, audioStream]) => {
        if (audioStream) {
          console.log(audioStream);
          console.log(audioStream.getAudioTracks());
          audioStream.getAudioTracks().forEach(track => screenStream.addTrack(track))
        }
        return screenStream;
      }));
    }
  }

  public dispose(): void {
    this.recorder.destroy();
  }

}