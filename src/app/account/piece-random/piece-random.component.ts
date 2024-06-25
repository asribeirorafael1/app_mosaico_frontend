import { environment } from './../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Options } from '@angular-slider/ngx-slider';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dimensions, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { MosaicPieceViewModel } from 'src/app/shared/views/MosaicPieceViewModel';
import { UploadService } from '../upload/services/upload.service';
import { WebsocketService } from 'src/app/shared/services/socket.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MosaicsService } from 'src/app/shared/services/mosaics.service';
import { MosaicItemViewModel } from 'src/app/shared/views/MosaicItemViewModel';
import { Subject } from 'rxjs/Rx';

@Component({
  selector: 'app-piece-random',
  templateUrl: './piece-random.component.html',
  styleUrls: ['./piece-random.component.scss'],
  providers: [WebsocketService]
})
export class PieceRandomComponent implements OnInit {

  mosaicTemplate: number = 0;

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

  nomeParticipante: string = "";
  pieceMosaic?: any;
  mosaic: MosaicItemViewModel = new MosaicItemViewModel();
  imagemParticipante: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  imageReceiveEvent: any = '';
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = false;
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
  updateImages: Subject<any>;

  ngOnInit(): void {
    // this.loading = true;
    let id = this.activeRoute.snapshot.params['id'];
    this.getPiece(id);
  }

  async getPiece(id: string) {
    if (id) {
      var MosaicoPiece = this.getLocalStorage(id);

      if (MosaicoPiece) {
        window.location.href = environment.site + "/#/upload/" + MosaicoPiece;
      }
    }
  }

  async generatePiece(){
    if (this.nomeParticipante.replace(" ", "") == "" || this.nomeParticipante.length < 3) {
      this.toastrService.warning('Informe o nome para seguir para próxima etapa.', 'Nome participante necessário!', {
        timeOut: 2000
      });
    } else {
      this.loading = true;

      let id = this.activeRoute.snapshot.params['id'];

      this.pieceMosaic = await this.uploadService.getPieceRandom(id, this.nomeParticipante);

      if(this.pieceMosaic.nome_participante == undefined){
        this.pieceMosaic.nome_participante = this.nomeParticipante;

        await this.uploadService.editPiece(this.pieceMosaic);
        this.sendUpdate({ "imagemID": this.pieceMosaic._id });

        if(this.pieceMosaic._id){
          this.setLocalStorage(id, this.pieceMosaic._id, 360);
          window.location.href = environment.site + "/#/upload/" + this.pieceMosaic._id;
        }else{
          this.loading = false;
        }
      }else{
        if(this.pieceMosaic._id){
          this.setLocalStorage(id, this.pieceMosaic._id, 360);
          window.location.href = environment.site + "/#/upload/" + this.pieceMosaic._id;
        }else{
          this.loading = false;
        }
      }
    }
  }

   // messages back to our socket.io server
   sendUpdate(msg: any) {
    this.updateImages.next(msg);
  }

  localStorageExpires() {
    var toRemove = [],                      //Itens para serem removidos
      currentDate = new Date().getTime(); //Data atual em milissegundos

    for (var i = 0, j = localStorage.length; i < j; i++) {
      var key = localStorage.key(i)!,
        itemValue = localStorage.getItem(key);

      //Verifica se o formato do item para evitar conflitar com outras aplicações
      if (itemValue && /^\{(.*?)\}$/.test(itemValue)) {

        //Decodifica de volta para JSON
        var current = JSON.parse(itemValue);

        //Checa a chave expires do item especifico se for mais antigo que a data atual ele salva no array
        if (current.expires && current.expires <= currentDate) {
          toRemove.push(key);
        }
      }
    }

    // Remove itens que já passaram do tempo
    // Se remover no primeiro loop isto poderia afetar a ordem,
    // pois quando se remove um item geralmente o objeto ou array são reordenados
    for (var i = toRemove.length - 1; i >= 0; i--) {
      localStorage.removeItem(toRemove[i]);
    }
  }
  /**
   * Função para adicionar itens no localStorage
   * @param {string} chave Chave que será usada para obter o valor posteriormente
   * @param {*} valor Quase qualquer tipo de valor pode ser adicionado, desde que não falhe no JSON.stringify
   * @param {number} minutos Tempo de vida do item
   */
  setLocalStorage(chave: any, valor: any, minutos: any) {
    var expirarem = new Date().getTime() + (60000 * minutos);

    localStorage.setItem(chave, JSON.stringify({
      "value": valor,
      "expires": expirarem
    }));
  }

  /**
   * Função para obter itens do localStorage que ainda não expiraram
   * @param {string} chave Chave para obter o valor associado
   * @return {*} Retorna qualquer valor, se o item tiver expirado irá retorna undefined
   */
  getLocalStorage(chave: any) {
    this.localStorageExpires();//Limpa itens

    var itemValue = localStorage.getItem(chave);

    if (itemValue && /^\{(.*?)\}$/.test(itemValue)) {

      //Decodifica de volta para JSON
      var current = JSON.parse(itemValue);

      return current.value;
    }
  }

  photoURL(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

}
