import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, switchMap, catchError, filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private API_URL = 'https://api.spotify.com/v1';
  private clientId = `eea8b97c4e754c898bc58978c62ac4a1`;
  private clientSecret = `b737690ab26b4fc7b1b41fcdd5512e1a`;

  // BehaviorSubject para almacenar el token
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable().pipe(filter((token): token is string => !!token));

  constructor(private http: HttpClient) {
    this.getAccessToken().subscribe(); // Solicita el token al inicializar el servicio
  }

  private getAccessToken(): Observable<string> {
    if (this.tokenSubject.value) {
      // Si ya existe un token, devuelve el observable del token actual
      return this.token$;
    }

    // Solicitud para obtener un nuevo token
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
    });

    const body = 'grant_type=client_credentials';

    return this.http.post<any>('https://accounts.spotify.com/api/token', body, { headers }).pipe(
      map((response) => {
        const token = response.access_token;
        if (token) {
          this.tokenSubject.next(token); // Actualiza el BehaviorSubject con el nuevo token
          return token;
        } else {
          throw new Error('No access token returned');
        }
      })
    );
  }

  search(query: string): Observable<any> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.get<any>(`${this.API_URL}/search`, {
          headers,
          params: {
            q: query,
            type: 'track', // Cambié esto a 'track' ya que debe ser un string en lugar de array
          },
        });
      })
    );
  }

  // Ejemplo de método que utiliza el token automáticamente
  getTopAlbums(): Observable<any[]> {
    return this.token$.pipe(
      take(1), // Tomamos solo un valor del token
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });
        return this.http.get<any>(`${this.API_URL}/browse/new-releases`, { headers }).pipe(
          map((data) => data.albums.items) // Ajusta según el dato que necesitas
        );
      })
    );
  }

  getAlbumDetails(albumId: string): Observable<any> {
    return this.token$.pipe(
      take(1), // Tomamos solo un valor del token
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });
        return this.http.get<any>(`${this.API_URL}/albums/${albumId}`, { headers });
      })
    );
  }
}


