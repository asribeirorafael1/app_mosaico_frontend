import { environment } from './../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import jwt_decode from 'jwt-decode'
import { MosaicItemViewModel } from '../views/MosaicItemViewModel';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class MosaicsService {

  constructor(
    private toastrService: ToastrService,
    private http: HttpClient
  ) { }

  async addMosaic(mosaic: any) {
    const result = await this.http.post<any>(`${environment.api}/mosaics/add`, mosaic).toPromise();
    if(result && result.Response){
      this.toastrService.success('Novo mosaico adicionado com sucesso.', 'Sucesso!', {
        timeOut: 2000
      });
      return true;
    }
    else{
      this.toastrService.error('Tente novamente, ou entre em contato com o administrador.', 'Erro ao salvar novo mosaico!', {
        timeOut: 2000
      });
      return false;
    }
  }

  async editMosaic(mosaic: any) {
    const result = await this.http.post<any>(`${environment.api}/mosaics/edit/` + mosaic._id, mosaic).toPromise();
    if(result && result.Response) {
      return true;
    }
    else {
      this.toastrService.error('Tente novamente, ou entre em contato com o administrador.', 'Erro ao editar mosaico!', {
        timeOut: 2000
      });
      return false;
    }
  }

  async closeMosaic(mosaic: any) {
    const result = await this.http.post<any>(`${environment.api}/mosaics/close/` + mosaic._id, mosaic).toPromise();
    if(result && result.Response) {
      return true;
    }
    else {
      this.toastrService.error('Tente novamente, ou entre em contato com o administrador.', 'Erro ao editar mosaico!', {
        timeOut: 2000
      });
      return false;
    }
  }

  async getAllMosaics(){
    const result = await this.http.get<any>(`${environment.api}/mosaics/getAll`).toPromise();
    if(result && result.Response){
      return result.Response;
    }
    else{
      this.toastrService.error('Tente novamente, ou entre em contato com o administrador.', 'Erro ao retornar mosaicos!', {
        timeOut: 2000
      });
      return false;
    }
  }

  async getAllMosaicsStatusActive(): Promise<MosaicItemViewModel[]> {
    const result = await this.http.get<any>(`${environment.api}/mosaics/getAllActive`).toPromise();
    if(result && result.Response){
      return result.Response;
    }
    else{
      this.toastrService.error('Tente novamente, ou entre em contato com o administrador.', 'Erro ao retornar mosaicos!', {
        timeOut: 2000
      });
      return [];
    }
  }

  async getMoisaicById(id: string){
    const result = await this.http.get<any>(`${environment.api}/mosaics/getById/` + id).toPromise();
    if(result && result.Response){
      return result.Response;
    }
    else{
      this.toastrService.error('Tente novamente, ou entre em contato com o administrador.', 'Erro ao retornar mosaicos!', {
        timeOut: 2000
      });
      return [];
    }
  }

  async getMoisaicByPiece(id: string){
    const result = await this.http.get<any>(`${environment.api}/mosaics/getByPiece/` + id).toPromise();
    if(result && result.Response){
      return result.Response;
    }
    else{
      this.toastrService.error('Tente novamente, ou entre em contato com o administrador.', 'Erro ao retornar mosaicos!', {
        timeOut: 2000
      });
      return [];
    }
  }

  async removeAllPieces(id: string) {
    const result = await this.http.get<any>(`${environment.api}/pieces/removeAllPieces/` + id).toPromise();
    if(result && result.Response){
      return result.Response;
    }
    else{
      this.toastrService.error('Tente novamente, ou entre em contato com o administrador.', 'Erro ao remover peças do mosaico!', {
        timeOut: 2000
      });
      return [];
    }
  }

  async getQrCodePDF(id: string) {
    let blob = await this.http.get(`${environment.api}/mosaics/qrcodePDF/` + id, {responseType: "blob"}).toPromise();

    const url= window.URL.createObjectURL(blob);

    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = "PDF-Mosaico.pdf";
    a.click();
    window.URL.revokeObjectURL(url);

    return true;
    // if(result && result.Response){
    //   return result.Response;
    // }
    // else{
    //   this.toastrService.error('Tente novamente, ou entre em contato com o administrador.', 'Erro ao remover peças do mosaico!', {
    //     timeOut: 2000
    //   });
    //   return [];
    // }
  }

  async getQrCodeMosaicGenerate(link: string, title: string) {
    let blob = await this.http.post(`${environment.api}/mosaics/qrcodemosaic`, {link}, {responseType: "blob"}).toPromise();

    const url= window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = "QrCode-Mosaico-"+title;
    a.click();
    window.URL.revokeObjectURL(url);

    return true;
  }

  async removeMosaic(id: string) {
    const result = await this.http.get<any>(`${environment.api}/mosaics/remove/` + id).toPromise();
    if(result && result.Response){
      return result.Response;
    }
    else{
      this.toastrService.error('Tente novamente, ou entre em contato com o administrador.', 'Erro ao remover peças do mosaico!', {
        timeOut: 2000
      });
      return [];
    }
  }

  async resetPiece(piece: any) {
    const result = await this.http.post<any>(`${environment.api}/pieces/reset-piece/` + piece._id, piece).toPromise();
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
