import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import { WebcamImage, WebcamInitError, WebcamUtil } from '@christianmenz/ngx-webcam';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements OnInit {
  @Output() pictureTaken = new EventEmitter<WebcamImage>();
  @Input() showWebcam = false;

  // toggle webcam on/off
  public allowCameraSwitch = false;
  public multipleWebcamsAvailable = false;
  public deviceId!: string;
  public videoOptions: MediaTrackConstraints = {
    width: {ideal: 300},
    height: {ideal: 300},
    facingMode: { ideal: 'environment' }
  };
  public errors: WebcamInitError[] = [];

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();
  showIconCam: boolean = false;
  devicesCam = new Array();

  getWidth() {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }

  public ngOnInit(): void {
  if (this.getWidth() >= 321)
    document.documentElement.style.setProperty(`--rigthCamIcon`, '12.5%');
  else
    document.documentElement.style.setProperty(`--rigthCamIcon`, '3.5%');

    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
        // this.devicesCam = mediaDevices;
      });
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.showIconCam = false;
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    console.info('received webcam image', webcamImage);
    this.pictureTaken.emit(webcamImage);
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.showIconCam = true;
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }
}
