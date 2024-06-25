import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ActivatedRoute } from '@angular/router';
import { AfterViewInit, Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UploadService } from './services/upload.service';
import { MosaicPieceViewModel } from 'src/app/shared/views/MosaicPieceViewModel';
import { Dimensions, ImageTransform } from 'src/app/shared/components/interfaces';
import { Options } from '@angular-slider/ngx-slider';
import { ToastrService } from 'ngx-toastr';
import { WebsocketService } from 'src/app/shared/services/socket.service';
import { Subject } from 'rxjs/Rx';
import { DomSanitizer } from '@angular/platform-browser';
import { MosaicItemViewModel } from 'src/app/shared/views/MosaicItemViewModel';
import { MosaicsService } from 'src/app/shared/services/mosaics.service';
import { WebcamImage } from '@christianmenz/ngx-webcam';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  providers: [WebsocketService]
})
export class UploadComponent implements OnInit {
  webcamImage!: WebcamImage;
  showWebcam: boolean = false;
  webcamImageExibe: boolean = false;

  handleImage(webcamImage: WebcamImage) {
    this.webcamImageExibe = true;
    this.imagemParticipante = webcamImage.imageAsDataUrl;

    setTimeout(() => {
      this.webcamImageExibe = false;
      var objDiv = document.getElementById("scrollPicture")!;
      // objDiv.scrollTop = 300;
      objDiv.scroll({
        behavior: 'smooth',
        left: 0,
        top: 445
      });
    }, 700);
  }

  updateImages: Subject<any>;
  mosaicTemplate: number = 0;
  step1: boolean = true;
  step2: boolean = true;
  step3: boolean = true;
  step4: boolean = true;
  step5: boolean = true;
  backIndex: string = "";
  isMobile: boolean = false;
  stepQrCode = "";
  adminVisible = false;
  insertedName = false;

  constructor(
    private activeRoute: ActivatedRoute,
    private uploadService: UploadService,
    private toastrService: ToastrService,
    private wsService: WebsocketService,
    public sanitizer: DomSanitizer,
    public mosaicsService: MosaicsService,
  ) {
    this.updateImages = <Subject<any>>wsService
      .connect()
      .map((response: any): any => {
        return response;
      });
  }

  pieceMosaic: MosaicPieceViewModel = new MosaicPieceViewModel();
  mosaic: MosaicItemViewModel = new MosaicItemViewModel();
  imagemParticipante: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  imageReceiveEvent: any = '';
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = true;
  transform: ImageTransform = {};
  zoomSlider: any;
  rotateSlider: any;
  loading = false;
  displayMosaic = false;

  valueRotate: number = 0;
  optionsRotate: Options = {
    floor: -2,
    ceil: 2,
    step: 0.0075,
    hideLimitLabels: true,
    hidePointerLabels: true
  };
  valueRotateBack: number = 0;

  valueZoom: number = 1;
  optionsZoom: Options = {
    floor: 0.05,
    ceil: 3,
    step: 0.05,
    hideLimitLabels: true,
    hidePointerLabels: true
  };
  valueZoomBack: number = 0;

  ngOnInit(): void {
    this.loading = true;
    let params = this.activeRoute.snapshot.params['id'];
    let id = params.split('&')[0];
    let step = params.split('&')[1]
    if (step) {
      if (step == "admin") {
        this.adminVisible = true;
      }
      else
        this.stepQrCode = step;
    }

    this.getPiece(id);

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }

    this.updateImages.unsubscribe();
    this.updateImages.subscribe(msg => {
      if (JSON.parse(msg.text).imagemID == this.pieceMosaic._id)
        this.advanceStep("step5")
      //this.updateMosaicWebSocket(this.pieceMosaic._id ? this.pieceMosaic._id : "");
    });
  }

  async getPiece(id: string) {
    if (id) {
      this.mosaic = await this.mosaicsService.getMoisaicByPiece(id);
      localStorage.setItem("ImageLocal", id);

      if (!this.mosaic.closed && this.stepQrCode == "") {
        this.pieceMosaic = await this.uploadService.getPieceById(id);
        if (this.pieceMosaic.nome_participante == "" || this.pieceMosaic.nome_participante == undefined) {
          this.loading = false;
          this.showWebcam = this.isMobile ? true : false;
          this.backIndex = "step1";
          this.step1 = false;
          this.step2 = true;
          this.step3 = true;
          this.step4 = true;
          this.step5 = true;
        } else {
          this.insertedName = true;
          if (!this.pieceMosaic.imagem_participante) {
            if (this.isMobile == true) {
              this.loading = false;
              this.showWebcam = this.isMobile ? true : false;
              this.backIndex = "step1";
              this.step1 = true;
              this.step2 = false;
              this.step3 = true;
              this.step4 = true;
              this.step5 = true;
            } else {
              this.loading = false;
              this.backIndex = "step1";
              this.step1 = true;
              this.step2 = false;
              this.step3 = true;
              this.step4 = true;
              this.step5 = true;
            }
          } else {
            this.loading = false;
            this.imagemParticipante = this.pieceMosaic.imagem_participante;
            this.showWebcam = this.isMobile ? true : false;
            this.backIndex = "step2";
            this.step1 = true;
            this.step2 = true;
            this.step3 = false;
            this.step4 = true;
            this.step5 = true;
          }
        }
      } else {
        this.insertedName = true;
        this.pieceMosaic = await this.uploadService.getPieceById(id);
        if (this.pieceMosaic.nome_participante)
          this.insertedName = true;
        this.imagemParticipante = this.pieceMosaic.imagem_participante;

        this.loading = false;

        this.advanceStep(this.stepQrCode);
      }
    }
  }

  readURL(input: any) {
    this.loading = true;
    this.imageChangedEvent = input;
    const updateImage = (image: any) => {
      this.imagemParticipante = image;
      this.loading = false;
    }

    if (input.currentTarget.files && input.currentTarget.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e: any) {
        var img = document.createElement("img");
        img.src = e.target.result;

        img.onload = function () {
          var canvas = document.createElement("canvas");
          var ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);

          var MAX_WIDTH = 450;
          var MAX_HEIGHT = 450;
          var width = img.width;
          var height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          var ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);

          let dataurl = canvas.toDataURL();

          updateImage(dataurl);
        }
      };

      reader.readAsDataURL(input.currentTarget.files[0]);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  imageLoaded() {
    this.showCropper = true;
  }

  cropperReady(sourceImageDimensions: Dimensions) {
  }

  loadImageFailed() {
  }

  rotateLeft(value: number) {
    // this.canvasRotation = this.canvasRotation + .1;
    this.canvasRotation = value;
    this.flipAfterRotate();
  }

  rotateRight(value: number) {
    // this.canvasRotation = this.canvasRotation - .1;
    this.canvasRotation = value;
    this.flipAfterRotate();
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH
    };
  }

  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH
    };
  }

  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV
    };
  }

  // resetImage() {
  //     this.scale = 1;
  //     this.rotation = 0;
  //     this.canvasRotation = 0;
  //     this.transform = {};
  // }

  zoomOut(value: number) {
    // this.scale -= .1;
    this.scale = value;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  zoomIn(value: number) {
    // this.scale += .1;
    this.scale = value;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  toggleContainWithinAspectRatio() {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }

  updateRotation() {
    this.transform = {
      ...this.transform,
      rotate: this.rotation
    };
  }

  onRotateChange(event: any) {
    if (event.value > this.valueRotateBack)
      this.rotateLeft(event.value);
    else
      this.rotateRight(event.value);

    this.valueRotateBack = event.value;
  }

  onZoomChange(event: any) {
    if (event.value > this.valueZoomBack)
      this.zoomIn(event.value);
    else
      this.zoomOut(event.value);

    this.valueZoomBack = event.value;
  }

  async sendImage() {
    if (this.pieceMosaic.imagem_participante) {
      this.loading = true;
      await this.uploadService.editPiece(this.pieceMosaic);
      this.sendUpdate({ "imagemID": this.pieceMosaic._id });
      setTimeout(() => {
        this.loading = false;
        this.backIndex = "step2";
        this.step1 = true;
        this.step2 = true;
        this.step3 = true;
        this.step4 = true;
        this.step5 = false;
      }, 2000);
    } else {
      this.toastrService.warning('Faça o upload da imagem para enviar.', 'Sem Imagem!', {
        timeOut: 2000
      });
    }
  }

  async sendImageValidation() {
    this.showWebcam = false;
    if (this.croppedImage) {
      this.pieceMosaic.imagem_participante = this.croppedImage;
      this.backIndex = "step3";
      this.step1 = true;
      this.step2 = true;
      this.step3 = true;
      this.step4 = false;
      this.step5 = true;
    } else {
      this.toastrService.warning('Faça o upload da imagem para enviar.', 'Sem Imagem!', {
        timeOut: 2000
      });
    }
  }

  // messages back to our socket.io server
  sendUpdate(msg: any) {
    this.updateImages.next(msg);
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
    return imagemQuadrante?.imagem_participante ? imagemQuadrante?.imagem_participante : this.mosaic.closed ? imagemQuadrante?.imagem_peca : "assets/images/image_loading.png";
  }

  updateColumns() {
    document.documentElement.style.setProperty(`--rowNum`, (this.mosaic.eixoY ? this.mosaic.eixoY : 0) + "");
    document.documentElement.style.setProperty(`--colNum`, (this.mosaic.eixoX ? this.mosaic.eixoX : 0) + "");
  }

  async activeMosaicScreen(id: string) {
    this.displayMosaic = true;
    this.mosaic = await this.mosaicsService.getMoisaicByPiece(id);
    this.mosaicTemplate = Math.ceil(Math.sqrt(this.mosaic.participantes ? this.mosaic.participantes : 0));
    this.updateColumns();
    this.loading = false;
  }

  async updateMosaicWebSocket(id: string) {
    this.mosaic = await this.mosaicsService.getMoisaicByPiece(id);
    this.mosaicTemplate = Math.ceil(Math.sqrt(this.mosaic.participantes ? this.mosaic.participantes : 0));
    this.updateColumns();
  }

  advanceStep(step: string) {
    switch (step) {
      case "step1":
        this.showWebcam = false;
        this.step1 = false;
        this.step2 = true;
        this.step3 = true;
        this.step4 = true;
        this.step5 = true;
        break;
      case "step2":
        this.showWebcam = false;
        this.backIndex = "step1";
        this.step1 = true;
        this.step2 = false;
        this.step3 = true;
        this.step4 = true;
        this.step5 = true;
        break;

      case "step3":
        this.showWebcam = this.isMobile ? true : false;
        this.backIndex = "step2";
        this.step1 = true;
        this.step2 = true;
        this.step3 = false;
        this.step4 = true;
        this.step5 = true;
        break;

      case "step4":
        this.showWebcam = false;
        this.backIndex = "step3";
        this.step1 = true;
        this.step2 = true;
        this.step3 = true;
        this.step4 = false;
        this.step5 = true;
        break;

      case "step5":
        this.showWebcam = false;
        this.backIndex = "step4";
        this.step1 = true;
        this.step2 = true;
        this.step3 = true;
        this.step4 = true;
        this.step5 = false;
        break;

      default:
        this.showWebcam = false;
        this.backIndex = "step1";
        this.step1 = false;
        this.step2 = true;
        this.step3 = true;
        this.step4 = true;
        this.step5 = true;
        break;
    }
  }

  async updateNamePiece(piece: any) {
    if (this.pieceMosaic.nome_participante.replace(" ", "") == "" || this.pieceMosaic.nome_participante.length < 3) {
      this.toastrService.warning('Informe o nome para seguir para próxima etapa.', 'Nome participante necessário!', {
        timeOut: 2000
      });
    } else {
      this.loading = true;
      await this.uploadService.editPiece(this.pieceMosaic);
      this.sendUpdate({ "imagemID": this.pieceMosaic._id });
      this.loading = false;
      // this.insertedName = true;
      this.advanceStep('step2')
    }
  }

  copyLinkPiece(piece: any) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = environment.site + '/#/upload/' + piece._id;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.toastrService.success('', 'Link da peça copiado com sucesso', {
      timeOut: 1000
    });
  }

}
