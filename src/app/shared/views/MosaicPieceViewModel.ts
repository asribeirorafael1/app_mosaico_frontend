export class MosaicPieceViewModel
{
  _id?: string;
  codigo_peca?: string;
  quadranteX: any;
  quadranteY: any;
  imagem_peca?: any;
  imagem_participante?: any;
  qr_image? : any;
  utilizavel?: boolean;
  ativo?: boolean;
  closed?: boolean;
  visible?: boolean;
  nome_participante!: string;
  focus?: boolean;

  constructor() {
    this.quadranteX = "";
    this.quadranteY = "";
  }
}
