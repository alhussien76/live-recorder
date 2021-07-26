import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as RecordRTC from 'recordrtc';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('videoRef', { static: false }) video: ElementRef;
  @ViewChild('startRecordingRef', { static: false }) startButton: ElementRef;
  @ViewChild('stopRecordingRef', { static: false }) stopButton: ElementRef;
  recorder: any;
  constructor() { }
  ngOnInit(): void {

  }
  startRecording(): void {
    // console.log(this.video.nativeElement);
    this.startButton.nativeElement.disabled = true;
    this.captureScreen((screen) => {
      this.video.nativeElement.srcObject = screen;
      this.recorder = new RecordRTC(screen, {
        type: 'video'
      });

      this.recorder.startRecording();
      // release screen on stopRecording
      this.recorder.screen = screen;

      this.stopButton.nativeElement.disabled = false;
    });
  }
  stopRecording(): void {
    this.stopButton.nativeElement.disabled = true;
    this.recorder.stopRecording(this.stopRecordingCallback);
  }
  invokeGetDisplayMedia(success, error): void {
    const displaymediastreamconstraints = {
      video: {
        displaySurface: 'monitor', // monitor, window, application, browser
        logicalSurface: true,
        cursor: 'always' // never, always, motion
      }
    };
    // above constraints are NOT supported YET
    // that's why overriding them
    // const displaymediastreamconstraints = {
    //   video: true
    // };

    // @ts-ignore
    if (navigator.mediaDevices.getDisplayMedia) {
      // @ts-ignore
      navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
    else {
      // @ts-ignore
      navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
  }
  captureScreen(callback): void {
    this.invokeGetDisplayMedia((screen) => {
      this.addStreamStopListener(screen, () => {
        this.stopButton.nativeElement.click();
      });
      callback(screen);
    }, (error) => {
      console.error(error);
      alert('Unable to capture your screen. Please check console logs.\n' + error);
    });
  }
  stopRecordingCallback(): void {
    this.video.nativeElement.src = null;
    this.video.nativeElement.srcObject = null;
    this.video.nativeElement.src = URL.createObjectURL(this.recorder.getBlob());

    this.recorder.screen.stop();
    this.recorder.destroy();
    this.recorder = null;
    this.startButton.nativeElement.disabled = false;
  }

  addStreamStopListener(stream, callback): void {
    stream.addEventListener('ended', () => {
      callback();
      callback = () => { };
    }, false);
    stream.addEventListener('inactive', () => {
      callback();
      callback = () => { };
    }, false);
    stream.getTracks().forEach((track) => {
      track.addEventListener('ended', () => {
        callback();
        callback = () => { };
      }, false);
      track.addEventListener('inactive', () => {
        callback();
        callback = () => { };
      }, false);
    });
  }
}
