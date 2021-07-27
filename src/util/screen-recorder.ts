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
      audio: true,
      video: true
    };
    const audioStreamConstraints: MediaStreamConstraints = {
      audio: true
    };
    return from(Promise.all([
      navigator.mediaDevices.getDisplayMedia(screenStreamConstraints) as Promise<MediaStream>,
      navigator.mediaDevices.getUserMedia(audioStreamConstraints) as Promise<MediaStream>
    ]).then(([screenStream, audioStream]) => {
      if (audioStream) {
        const audioContext = new AudioContext();
        const mixedAudioStream = audioContext.createMediaStreamDestination();
        audioContext.createMediaStreamSource(audioStream).connect(mixedAudioStream);
        audioContext.createMediaStreamSource(new MediaStream(screenStream.getAudioTracks())).connect(mixedAudioStream);
        return new MediaStream([...screenStream.getVideoTracks(), ...mixedAudioStream.stream.getAudioTracks()])
      } else {
        return screenStream;
      }
    }));
  }

  public dispose(): void {
    this.recorder.destroy();
  }

}