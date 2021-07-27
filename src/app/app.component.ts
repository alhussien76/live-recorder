import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ScreenRecorder } from 'src/util/screen-recorder';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('videoRef', { static: false }) video: ElementRef;
  @ViewChild('startRecordingRef', { static: false }) startButton: ElementRef;
  @ViewChild('stopRecordingRef', { static: false }) stopButton: ElementRef;

  screenRecorder = new ScreenRecorder();

  constructor() { }
 
  startRecording(): void {
    this.screenRecorder.startRecording();
    this.screenRecorder.bolb$.subscribe(blob => {
        this.video.nativeElement.src = URL.createObjectURL(blob);
    });
  }

  stopRecording(): void {
    this.screenRecorder.stopRecording();
  }
  
}

