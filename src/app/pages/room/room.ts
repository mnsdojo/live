import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room',
  imports: [FormsModule, CommonModule],
  templateUrl: './room.html',
  styleUrl: './room.css',
})
export class Room {
  @ViewChild('video', { static: false })
  videoRef!: ElementRef<HTMLVideoElement>;

  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: BlobPart[] = [];
  recordedBlob: Blob | null = null;

  stream: MediaStream | null = null;
  isRecording = signal(false);
  isSharing = signal(false);
  isPaused = signal(false);

  async shareScreen() {
    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();

      this.isSharing.set(true);
      this.isPaused.set(false);

      this.stream.getVideoTracks()[0].onended = () => this.stop();
    } catch (error) {
      console.error('Screen share failed:', error);
    }
  }
  startRecording() {
    if (!this.stream || this.isRecording()) return;
    this.recordedChunks = [];

    const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? { mimeType: 'video/webm;codecs=vp9' }
      : { mimeType: 'video/webm;codecs=vp8' };
    this.mediaRecorder = new MediaRecorder(this.stream, options);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    this.mediaRecorder.onstop = () => {
      this.recordedBlob = new Blob(this.recordedChunks, {
        type: 'video/webm',
      });
    };
    this.mediaRecorder.start();
    this.isRecording.set(true);
  }

  togglePauseResume() {
    if (!this.stream) return;
    const videoTrack = this.stream.getVideoTracks()[0];
    const shouldPause = videoTrack.enabled;
    videoTrack.enabled = !shouldPause;
    if (shouldPause) {
      this.isPaused.set(true);
    } else {
      this.isPaused.set(false);
    }
  }
  stopRecord() {
    if (!this.mediaRecorder || !this.isRecording()) return;
    this.mediaRecorder.stop();
    this.isRecording.set(false);
  }

  stop() {
    if (!this.stream) return;
    this.stream.getTracks().forEach((t) => t.stop());

    if (this.videoRef?.nativeElement) {
      this.videoRef.nativeElement.srcObject = null;
    }

    this.stream = null;
    this.isPaused.set(false);
    this.isSharing.set(false);
  }

  downloadStream() {
    if (!this.recordedBlob) return;
    const url = URL.createObjectURL(this.recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liveit-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  }
  resume() {
    if (!this.stream) return;
    this.stream.getVideoTracks()[0].enabled = true;
    this.isPaused.set(false);
  }
}
