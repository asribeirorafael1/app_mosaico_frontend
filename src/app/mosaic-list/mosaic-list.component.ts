import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { MosaicsService } from './../shared/services/mosaics.service';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MosaicItemViewModel } from '../shared/views/MosaicItemViewModel';
import { MatDialog } from '@angular/material/dialog';
import { ModalAddMosaicComponent } from '../shared/components/modal-add-mosaic/modal-add-mosaic.component';
import { DomSanitizer } from '@angular/platform-browser';
import { WebsocketService } from '../shared/services/socket.service';
import { Subject } from 'rxjs/Rx';

const mosaicListDataSourceInit: MosaicItemViewModel[] = [];

@Component({
  selector: 'app-mosaic-list',
  templateUrl: './mosaic-list.component.html',
  styleUrls: ['./mosaic-list.component.scss'],
  providers: [WebsocketService]
})
export class MosaicListComponent implements OnInit {

  updateImages: Subject<any>;

  constructor(
    public dialog: MatDialog,
    public mosaicsService: MosaicsService,
    public sanitizer: DomSanitizer,
    public toastrService: ToastrService,
    private wsService: WebsocketService
  ) {
    this.updateImages = <Subject<any>>wsService
    .connect()
    .map((response: any): any => {
      return response;
    });
   }

  @Input() getAllMosaicsEventEmmitter: EventEmitter<any> = new EventEmitter();

  displayedColumns: string[] = ['codigo_treinamento', 'participantes', 'lista_pecas', 'lista_pecas_restantes', 'imagem', 'status', 'actions'];
  dataSource = new MatTableDataSource(mosaicListDataSourceInit);
  loading = false;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
    this.updateImages.unsubscribe();
    this.loading = true;
    this.getAllMosaics();
  }

  async getAllMosaics() {
    let mosaicos = await this.mosaicsService.getAllMosaics();

    this.dataSource = new MatTableDataSource(mosaicos);

    this.loading = false;
  }

  addNewMosaic() {
    const dialogRef = this.dialog.open(ModalAddMosaicComponent, {
      width: '65%',
      height: '65%'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.getAllMosaics();
    });
  }

  desactiveInfos(element: any) {
    this.mosaicsService.editMosaic(element);
  }

  async closedMosaic(element: any) {
    this.loading = true;
    await this.mosaicsService.closeMosaic(element);
    this.imageClosedUpdate("Mosaico Fechado.");
    setTimeout(() => {
      this.loading = false;
      this.toastrService.success('Mosaico alterado com sucesso.', 'Sucesso!', {
        timeOut: 2000
      });
    }, 1000);
  }

  async resetarPecasMosaico(id: string) {
    this.loading = true;
    await this.mosaicsService.removeAllPieces(id);
    setTimeout(() => {
      this.getAllMosaics();
      this.loading = false;
      this.toastrService.success('Configurações do mosaico resetadas.', 'Sucesso!', {
        timeOut: 2000
      });
    }, 2000);
  }

  async gerarPDF(id: string) {
    this.loading = true;
    await this.mosaicsService.getQrCodePDF(id);
    this.loading = false;
  }

  photoURL(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  copyUrlMosaic(id: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = environment.site + '/#/piece-random/' + id;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.toastrService.success('', 'URL do Mosaico copiada com sucesso gerando QR Code!', {
      timeOut: 2000
    });
  }

  async copyQRCodeMosaic(id: string, title: string){
    let link = environment.site + '/#/piece-random/' + id;
    this.copyUrlMosaic(id);
    this.loading = true;
    await this.mosaicsService.getQrCodeMosaicGenerate(link, title);
    this.loading = false;
  }

  async deleteMosaic(id: string){
    this.loading = true;
    await this.mosaicsService.removeMosaic(id);
    setTimeout(() => {
      this.getAllMosaics();
      this.loading = false;
      this.toastrService.success('Mosaico removido com sucesso.', 'Sucesso!', {
        timeOut: 2000
      });
    }, 2000);
  }

  imageClosedUpdate(msg: any) {
    this.updateImages.next(msg);
  }

}
