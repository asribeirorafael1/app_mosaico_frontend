import { MosaicPieceViewModel } from 'src/app/shared/views/MosaicPieceViewModel';
import { environment } from './../../environments/environment';
import { MosaicItemViewModel } from './../shared/views/MosaicItemViewModel';
import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { MosaicsService } from '../shared/services/mosaics.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs/Rx';
import { WebsocketService } from '../shared/services/socket.service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [WebsocketService]
})
export class DashboardComponent implements OnInit, OnDestroy {

  updateImages: Subject<any>;
  realTime: boolean = false;
  filterPieceSelected: any;
  piecesOptionsList = [{
    key: 1,
    value: "Todas as peças"
  }, {
    key: 4,
    value: "Peças enviadas"
  }, {
    key: 2,
    value: "Peças não enviadas"
  }, {
    key: 3,
    value: "Peças não geradas"
  }];
  piecesListFiltered?: Array<MosaicPieceViewModel> = new Array<MosaicPieceViewModel>();
  FilterPieceOpt: any = this.piecesOptionsList[0];

  constructor(
    public mosaicsService: MosaicsService,
    private elRef: ElementRef,
    public sanitizer: DomSanitizer,
    private wsService: WebsocketService,
    public toastrService: ToastrService
  ) {
    this.updateImages = <Subject<any>>wsService
      .connect()
      .map((response: any): any => {
        return response;
      });
  }

  mosaicsActive: Array<MosaicItemViewModel> = new Array<MosaicItemViewModel>();
  mosaicSelected: MosaicItemViewModel = new MosaicItemViewModel();
  mosaicTemplate: number = 0;
  loadingImages = true;
  loading = false;

  ngOnInit(): void {
    this.getAllMosaicsStatusActive();

    this.updateImages.unsubscribe();
    this.updateImages.subscribe(msg => {
      this.updateImagesSocket();
    });
  }

  async getAllMosaicsStatusActive() {
    this.loading = true;
    let mosaicos = await this.mosaicsService.getAllMosaicsStatusActive();

    this.mosaicsActive = mosaicos;

    if (mosaicos.length) {
      this.mosaicSelected = mosaicos[0];
      this.filterPieceSelected = this.piecesOptionsList[0];
      let mosaicoWithPieces = await this.mosaicsService.getMoisaicById(this.mosaicSelected._id ? this.mosaicSelected._id : "");
      this.mosaicSelected.lista_pecas = mosaicoWithPieces.lista_pecas.sort(this.compare);
      this.piecesListFiltered = this.mosaicSelected.lista_pecas ? this.mosaicSelected.lista_pecas : [];
      this.loadingImages = false;
      this.mosaicTemplate = Math.ceil(Math.sqrt(this.mosaicSelected.participantes ? this.mosaicSelected.participantes : 0));
      this.updateColumns();
      this.loading = false;
    } else {
      this.loadingImages = false;
      this.loading = false;
    }
  }

  returnImageQuadrante(x: number, y: number) {
    let imagemQuadrante = this.mosaicSelected.lista_pecas?.find(f => parseInt(f.quadranteX) === (x + 1) && parseInt(f.quadranteY) === (y + 1));
    return imagemQuadrante?.imagem_participante ? imagemQuadrante?.imagem_participante : imagemQuadrante?.imagem_peca;
  }

  returnImageId(x: number, y: number) {
    let imagemQuadrante = this.mosaicSelected.lista_pecas?.find(f => parseInt(f.quadranteX) === (x + 1) && parseInt(f.quadranteY) === (y + 1));
    return imagemQuadrante;
  }

  returnImageFocus(x: number, y: number) {
    let imagemQuadrante = this.mosaicSelected.lista_pecas?.find(f => parseInt(f.quadranteX) === (x + 1) && parseInt(f.quadranteY) === (y + 1));
    return imagemQuadrante?.focus;
  }

  arrayMatriz(n: any): any[] {
    let numberArray = parseInt(n);
    return Array(numberArray);
  }

  async setItemSelecionado(item: any) {
    this.loading = true;
    this.loadingImages = true;
    this.mosaicSelected = item;
    let mosaicoWithPieces = await this.mosaicsService.getMoisaicById(this.mosaicSelected._id ? this.mosaicSelected._id : "");
    this.mosaicSelected.lista_pecas = mosaicoWithPieces.lista_pecas.sort(this.compare);
    this.piecesListFiltered = this.mosaicSelected.lista_pecas ? this.mosaicSelected.lista_pecas : [];

    this.loadingImages = false;
    this.mosaicTemplate = Math.ceil(Math.sqrt(this.mosaicSelected.participantes ? this.mosaicSelected.participantes : 0));
    this.updateColumns();
    this.loading = false;
  }

  updateColumns() {

    if (this.mosaicSelected.eixoY * 2 == this.mosaicSelected.eixoX)
      document.documentElement.style.setProperty(`--widthMosaic`, '99%');
    else
      if (this.mosaicSelected.eixoX - this.mosaicSelected.eixoY >= 1)
        document.documentElement.style.setProperty(`--widthMosaic`, '58.5%');
      else
        document.documentElement.style.setProperty(`--widthMosaic`, '56%');
  }

  photoURL(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  redirectToPiece(image?: MosaicPieceViewModel) {
    if (image && image?.imagem_participante)
      window.open(environment.site + '/#/upload/' + image?._id + "&admin", '_blank');
    else
      window.open(environment.site + '/#/upload/' + image?._id, '_blank');
  }

  compare(a: any, b: any) {
    if (parseInt(a.quadranteY) < parseInt(b.quadranteY)) {
      return -1;
    }
    if (parseInt(a.quadranteY) > parseInt(b.quadranteY)) {
      return 1;
    }
    return 0;
  }

  async updateImagesSocket() {
    let mosaicoWithPieces = await this.mosaicsService.getMoisaicById(this.mosaicSelected._id ? this.mosaicSelected._id : "");
    this.mosaicSelected.lista_pecas = mosaicoWithPieces.lista_pecas.sort(this.compare);
    this.piecesListFiltered = this.mosaicSelected.lista_pecas ? this.mosaicSelected.lista_pecas : [];

    let options = this.FilterPieceOpt;

    this.piecesListFiltered = this.mosaicSelected.lista_pecas?.filter(function (item) {
      switch (options.key) {
        case 1:
          return true;
          break;
        case 2:
          return (item.utilizavel == false && item.imagem_participante == undefined) || (item.utilizavel == false && item.imagem_participante == "");
          break;
        case 3:
          return item.utilizavel == true;
          break;
        case 4:
          return item.imagem_participante != undefined && item.imagem_participante != "";
          break;
        default:
          return true;
          break;
      }
    });
  }

  ngOnDestroy() {
    this.updateImages.unsubscribe();
  }

  openRealTimeMosaic() {
    this.realTime = true;
  }

  onCloseRealTime(event: any) {
    this.realTime = false;
  }

  changeFilterPieces(option: any) {
    this.FilterPieceOpt = option;
    this.piecesListFiltered = this.mosaicSelected.lista_pecas?.filter(function (item) {
      switch (option.key) {
        case 1:
          return true;
          break;
        case 2:
          return (item.utilizavel == false && item.imagem_participante == undefined) || (item.utilizavel == false && item.imagem_participante == "");
          break;
        case 3:
          return item.utilizavel == true;
          break;
        case 4:
          return item.imagem_participante != undefined && item.imagem_participante != "";
          break;
        default:
          return true;
          break;
      }
    });
  }

  async resetPiece(piece: any) {
    await this.mosaicsService.resetPiece(piece);

    let mosaicoWithPieces = await this.mosaicsService.getMoisaicById(this.mosaicSelected._id ? this.mosaicSelected._id : "");
    this.mosaicSelected.lista_pecas = mosaicoWithPieces.lista_pecas.sort(this.compare);
    this.piecesListFiltered = this.mosaicSelected.lista_pecas ? this.mosaicSelected.lista_pecas : [];
    this.mosaicTemplate = Math.ceil(Math.sqrt(this.mosaicSelected.participantes ? this.mosaicSelected.participantes : 0));
    this.updateColumns();

    this.toastrService.success('', 'Imagem resetada com sucesso', {
      timeOut: 1000
    });
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toUpperCase();

    if(filterValue === ""){
      let options = this.FilterPieceOpt;

      this.piecesListFiltered = this.mosaicSelected.lista_pecas?.filter(function (item) {
        switch (options.key) {
          case 1:
            return true;
            break;
          case 2:
            return (item.utilizavel == false && item.imagem_participante == undefined) || (item.utilizavel == false && item.imagem_participante == "");
            break;
          case 3:
            return item.utilizavel == true;
            break;
          case 4:
            return item.imagem_participante != undefined && item.imagem_participante != "";
            break;
          default:
            return true;
            break;
        }
      });
    }else{
      let listaOne = this.piecesListFiltered?.filter(function (objeto: any) {
        let nomePart = objeto.nome_participante ? objeto.nome_participante.toUpperCase() : "";
        return nomePart ? nomePart.indexOf(filterValue) !== -1 : null;
      });

      this.piecesListFiltered = listaOne;
    }
  }
}
