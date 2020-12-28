import { Injectable } from '@angular/core';
import {Cliente} from './cliente';
import {Region} from './region';
import {Observable,of, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {HttpClient, HttpHeaders, HttpRequest, HttpEvent} from '@angular/common/http';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
import {formatDate} from '@angular/common';

@Injectable()
export class ClienteService{

  private http: HttpClient;
  private urlEndPoint: string = 'http://localhost:8090/api/clientes';
  private httpHeader = new HttpHeaders({'Content-Type': 'application/json'});
  private router: Router;

  constructor(http: HttpClient, router: Router) {
    this.http = http;
    this.router = router;
  }
  getClientes(numPage: number): Observable<any>{
    return this.http.get(this.urlEndPoint + '/page/' + numPage)
                    .pipe(
                        map( (response:any) => {
                          (response.content as Cliente[]).map(
                                                        cliente => {
                                                        cliente.nombre = cliente.nombre.toUpperCase();
                                                        cliente.fecha = formatDate(cliente.fecha, 'fullDate', 'en-US');
                                                        return cliente;
                                                      });
                        return response;
                        })
                      );
  }
  createCliente(cliente: Cliente): Observable<Cliente>{
    return this.http.post(this.urlEndPoint, cliente, {headers:this.httpHeader}).pipe(
      map((json: any) => json.cliente as Cliente),
      catchError(e => {
        if(e.status == 400){
          return throwError(e);
        }
        console.error(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }
  getCliente(id): Observable<Cliente>{
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/clientes']);
        console.error(e.error.mensaje);
        swal('Error al editar', e.error.mensaje,'error');
        return throwError(e);
      })
    )
  }
  updateCliente(cliente: Cliente): Observable<Cliente>{
    return this.http.put(`${this.urlEndPoint}/${cliente.id}`, cliente, {headers: this.httpHeader}).pipe(
      map((json: any) => json.cliente as Cliente),
      catchError(e => {
        if(e.status == 400){
          return throwError(e);
        }
        console.error(e.error.mensaje);
        swal(e.error.mensaje, e.error.error,'error');
        return throwError(e);
      })
    );
  }
  deleteCliente(id: number): Observable<Cliente>{
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`, {headers:this.httpHeader}).pipe(
      catchError(e => {
        console.error(e.error.mensaje);
        swal(e.error.mensaje, e.error.error,'error');
        return throwError(e);
      })
    );
  }
  subirFoto(archivo: File, id): Observable<HttpEvent<{}>>{

    let formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id", id);
    const req = new HttpRequest('POST', `${this.urlEndPoint}/upload`, formData,{reportProgress: true} );

    return this.http.request(req);
  }
  getRegiones(): Observable<Region[]>{
    return this.http.get<Region[]>(this.urlEndPoint + '/regiones');
  }

}
