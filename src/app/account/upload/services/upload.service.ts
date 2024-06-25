import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MosaicPieceViewModel } from 'src/app/shared/views/MosaicPieceViewModel';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(
    private toastrService: ToastrService,
    private http: HttpClient,
  ) { }

  async getPieceById(id: string): Promise<MosaicPieceViewModel>{
    const result = await this.http.get<any>(`${environment.api}/pieces/getByIdUsability/` + id).toPromise();
    if(result && result.Response) {
      return result.Response;
    }
    else{
      this.toastrService.error('Tente novamente, ou entre em contato com o administrador.', 'Erro ao retornar peça do mosaico!', {
        timeOut: 2000
      });
      return new MosaicPieceViewModel();
    }
  }

  async getPieceRandom(id: string, name: string): Promise<MosaicPieceViewModel>{
    const result = await this.http.post<any>(`${environment.api}/pieces/random/`+ id, { nomeParticipante: name}).toPromise();
    if(result && result.Response) {
      return result.Response;
    }
    else {
      this.toastrService.error('Tente novamente, ou entre em contato com o administrador.', 'Erro ao retornar peça do mosaico!', {
        timeOut: 2000
      });
      return new MosaicPieceViewModel();
    }
  }

  async editPiece(piece: any) {
    const result = await this.http.post<any>(`${environment.api}/pieces/edit/` + piece._id, piece).toPromise();
    if(result && result.Response) {
      return true;
    }
    else {
      this.toastrService.error('Tente novamente, ou entre em contato com o administrador.', 'Erro ao editar peça do mosaico!', {
        timeOut: 2000
      });
      return false;
    }
  }

}
