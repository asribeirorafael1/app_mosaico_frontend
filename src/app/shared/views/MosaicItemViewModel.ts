import { MosaicPieceViewModel } from "./MosaicPieceViewModel";

export class MosaicItemViewModel
{
  _id?: string;
  codigo_treinamento?: string;
  participantes?: number;
  imagem?: any;
  qrcode?: any;
  lista_pecas?: Array<MosaicPieceViewModel>;
  ativo?: boolean;
  eixoX: number;
  eixoY: number;
  closed?: boolean;
  status?: boolean;

  constructor() {
    this.eixoX = 0;
    this.eixoY = 0;
  }
}
