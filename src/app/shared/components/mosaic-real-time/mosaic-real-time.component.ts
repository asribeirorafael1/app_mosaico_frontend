import { MosaicItemViewModel } from './../../views/MosaicItemViewModel';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs/Rx';
import { WebsocketService } from '../../services/socket.service';
import { MosaicsService } from '../../services/mosaics.service';

@Component({
  selector: 'app-mosaic-real-time',
  templateUrl: './mosaic-real-time.component.html',
  styleUrls: ['./mosaic-real-time.component.scss']
})
export class MosaicRealTimeComponent implements OnInit {

  @Output() closeRealTime: EventEmitter<boolean> = new EventEmitter();
  @Input() mosaicDashboard: any;
  mosaic: MosaicItemViewModel = new MosaicItemViewModel();
  updateImages: Subject<any>;
  mosaicTemplate: number = 0;
  mosaicoVisible: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    private wsService: WebsocketService,
    public mosaicsService: MosaicsService
  ) {
    this.updateImages = <Subject<any>>wsService
      .connect()
      .map((response: any): any => {
        return response;
      });
  }

  ngOnInit(): void {
    this.mosaic = this.mosaicDashboard;
    this.mosaic.lista_pecas?.forEach(piece => {
      piece.visible = false;
    });
    this.updateColumns();

    this.updateImages.unsubscribe();
    this.updateImages.subscribe(msg => {
      this.updateMosaicWebSocket(this.mosaic._id ? this.mosaic._id : "");
    });
  }

  arrayMatriz(n: any): any[] {
    let numberArray = parseInt(n);
    return Array(numberArray);
  }

  photoURL(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  returnImageQuadrante(x: number, y: number) {
    let imagemQuadrante = this.mosaic.lista_pecas?.find(f => parseInt(f.quadranteX) === (x + 1) && parseInt(f.quadranteY) === (y + 1));
    return imagemQuadrante?.imagem_participante ? imagemQuadrante?.imagem_participante : imagemQuadrante?.imagem_peca;
  }

  async updateMosaicWebSocket(id: string) {
    this.mosaic = await this.mosaicsService.getMoisaicById(id);
    this.updateColumns();
  }

  updateColumns() {
    document.documentElement.style.setProperty(`--rowNum`, (this.mosaic.eixoY ? this.mosaic.eixoY : 0) + "");
    document.documentElement.style.setProperty(`--colNum`, (this.mosaic.eixoX ? this.mosaic.eixoX : 0) + "");

    if(this.mosaic.eixoY * 2 == this.mosaic.eixoX)
      document.documentElement.style.setProperty(`--widthMosaic`, '99%');
    else
      if(this.mosaic.eixoX - this.mosaic.eixoY >= 1)
        document.documentElement.style.setProperty(`--widthMosaic`, '58.5%');
      else
        document.documentElement.style.setProperty(`--widthMosaic`, '56%');
  }

  onClose() {
    this.closeRealTime.emit(false);
  }

  startShow() {
    this.mosaicoVisible = true;
    let counter = 0;
    let mosaicListPieces = this.mosaic;
    let functionRandom = this.openPieceRandom;

    let i = setInterval(function(){
      functionRandom(mosaicListPieces);

      counter++;
      if(counter === mosaicListPieces.lista_pecas?.length) {
          clearInterval(i);
      }
    }, 300)
  }

  returnImageShow(x: number, y: number): boolean {
    let imagemQuadrante = this.mosaic.lista_pecas?.find(f => parseInt(f.quadranteX) === (x + 1) && parseInt(f.quadranteY) === (y + 1));
    return imagemQuadrante ? imagemQuadrante.visible ? imagemQuadrante.visible : false : false;
  }

  openPieceRandom(mosaic: MosaicItemViewModel): boolean {
    let lista_pecas = mosaic.lista_pecas?.filter(f => f.visible === false);
    let pieceVisible: any;

    if (lista_pecas?.length !== 0) {
      pieceVisible = lista_pecas ? lista_pecas[Math.floor(Math.random() * lista_pecas.length)] : {};

      pieceVisible.visible = true;

    } else {
      return false;
    }

    mosaic.lista_pecas?.forEach(piece => {
      if(piece._id == pieceVisible._id)
        piece.visible = true;
    });

    return true;
  }

}
