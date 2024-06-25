import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';
import * as Rx from 'rxjs/Rx';

@Injectable()
export class WebsocketService {

  private socket: any;

  constructor() { }

  connect(): Rx.Subject<String> {
    this.socket = io(environment.ws, {
      path:'/socket-mosaiko'
    });

    let observable = new Observable(observer => {
        this.socket.on('receivedUpdateImage', (data: any) => {
          observer.next(data);
        })
        return () => {
          this.socket.disconnect();
        }
    });

    let observer = {
        next: (data: Object) => {
            this.socket.emit('sendUploadImage', JSON.stringify(data));
        },
    };
    return Rx.Subject.create(observer, observable);
  }

}
