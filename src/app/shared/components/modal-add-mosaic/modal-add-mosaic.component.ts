import { ToastrService } from 'ngx-toastr';
import { MosaicsService } from './../../services/mosaics.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MosaicItemViewModel } from './../../views/MosaicItemViewModel';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { multicast } from 'rxjs/operators';
import { MosaicPieceViewModel } from '../../views/MosaicPieceViewModel';
import * as buffer from 'buffer';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-modal-add-mosaic',
  templateUrl: './modal-add-mosaic.component.html',
  styleUrls: ['./modal-add-mosaic.component.scss']
})
export class ModalAddMosaicComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ModalAddMosaicComponent>,
    public mosaicsService: MosaicsService,
    public sanitizer: DomSanitizer,
    public toastrService: ToastrService
  ) { }

  newMosaic: MosaicItemViewModel = new MosaicItemViewModel();
  mosaicTemplate = 0;
  imagePieces: Array<any> = new Array<any>();
  loadingImages = false;
  numColsToCutReal = 0;
  numRowsToCutReal = 0;
  loading = false;

  arrayMatriz(n: number): any[] {
    return Array(n);
  }
  ngOnInit(): void {
    this.newMosaic = new MosaicItemViewModel();
  }

  cancel() {
    this.dialogRef.close();
  }

  async save() {
    if (!this.newMosaic.participantes || this.newMosaic.lista_pecas == undefined || this.newMosaic.lista_pecas.length == 0) {
      this.toastrService.warning('Por favor insira o número de participantes e gere as peças.', 'Atenção aos Pontos!', {
        timeOut: 2000
      });
    } else {
      this.loading = true;
      const ok = await this.mosaicsService.addMosaic(this.newMosaic);
      if (ok === true) {
        this.dialogRef.close()
        this.loading = false;
      }
    }
  }

  readURL(input: any) {
    this.loading = true;
    const elementoImagem = document.getElementById('imagemUpload')!;

    this.loadingImages = true;

    const updateImage = (image: any) => {
      this.newMosaic.imagem = image;
      setTimeout(() => {
        this.cutImageUp();
      }, 1000);

    }

    if (input.currentTarget.files && input.currentTarget.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e: any) {
        elementoImagem.setAttribute('src', e.target.result);
        updateImage(e.target.result);
      };

      reader.readAsDataURL(input.currentTarget.files[0]);
    }
  }

  cutImageUp() {
    let widthOfOnePiece = 250;
    let heightOfOnePiece = 250;

    this.loadingImages = true;

    const image = <HTMLImageElement>document.getElementById("imagemUpload")!;

    this.mosaicTemplate = Math.ceil(Math.sqrt(this.newMosaic.participantes ? this.newMosaic.participantes : 0));

    if (Math.sqrt(this.newMosaic.participantes ? this.newMosaic.participantes : 0) % 1 != 0 && !isNaN(Math.sqrt(this.newMosaic.participantes ? this.newMosaic.participantes : 0) % 1)) {

      let eixoMaximo = Math.ceil((this.newMosaic.participantes ? this.newMosaic.participantes : 0) / 2);
      let lista_prob = new Array<any>();

      for (let x = 2; x <= eixoMaximo; x++) {
        for (let y = 2; y <= eixoMaximo; y++) {
          if (x * y >= (this.newMosaic.participantes ? this.newMosaic.participantes : 0) && y - x > 0) {
            let newProb: any;
            newProb = {
              x: x,
              y: y,
              diferenca: y - x,
              area: x * y
            }
            lista_prob.push(newProb);
          }
        }
      }

      lista_prob.sort(function (a, b) {
        if (a.area <= b.area) {
          return a.diferenca <= b.diferenca ? -1 : 1;
        }
        if (a.area > b.area) {
          return 1;
        }
        return 0;
      });

      this.numColsToCutReal = lista_prob[0].y;
      this.numRowsToCutReal = lista_prob[0].x;


    } else {
      this.numColsToCutReal = this.mosaicTemplate;
      this.numRowsToCutReal = this.mosaicTemplate;
    }


    let largura = image.naturalWidth / (this.numColsToCutReal * widthOfOnePiece);
    let altura = image.naturalHeight / (this.numRowsToCutReal * heightOfOnePiece);

    this.imagePieces = [];
    this.newMosaic.lista_pecas = new Array<MosaicPieceViewModel>();

    for (var x = 0; x < this.numColsToCutReal; ++x) {
      for (var y = 0; y < this.numRowsToCutReal; ++y) {
        const canvas = <HTMLCanvasElement>document.createElement('canvas');
        canvas.width = widthOfOnePiece;
        canvas.height = heightOfOnePiece;
        const context = canvas.getContext("2d")!;
        context.drawImage(image, x * widthOfOnePiece * largura, y * heightOfOnePiece * altura, widthOfOnePiece * largura, heightOfOnePiece * altura, 0, 0, widthOfOnePiece, heightOfOnePiece);

        let objPiece = new MosaicPieceViewModel();
        objPiece.codigo_peca = new Date().getDate() + "";
        objPiece.quadranteX = x + 1;
        objPiece.quadranteY = y + 1;
        objPiece.imagem_peca = canvas.toDataURL();

        this.imagePieces.push({ "quadranteX": x + 1, "quadranteY": y + 1, "image": canvas.toDataURL() });

        this.newMosaic.lista_pecas?.push(objPiece);
      }
    }

    this.newMosaic.eixoX = this.numColsToCutReal;
    this.newMosaic.eixoY = this.numRowsToCutReal;

    this.loadingImages = false;

    this.updateColumns();

    this.loading = false;
  }

  returnImageQuadrante(x: number, y: number) {
    return this.imagePieces.find(f => f.quadranteX === (x + 1) && f.quadranteY === (y + 1))?.image;
  }


  base64ToArrayBuffer(base64: string) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  dataURItoBlob(dataURI: string) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  }

  updateColumns() {
    document.documentElement.style.setProperty(`--rowNum`, this.numRowsToCutReal + "");
    document.documentElement.style.setProperty(`--colNum`, this.numColsToCutReal + "");
  }

  convertToSVG(image: any) {
    //get svg source.
    // var serializer = new XMLSerializer();
    var source = image.split(',')[1];

    //add name spaces.
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    //add xml declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    //convert svg source to URI data scheme.
    var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    return url;
  }

  photoURL(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
