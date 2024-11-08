import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { SpotifyService } from '../services/spotify.service';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-album-list',
  imports: [NgFor],
  templateUrl: './album-list.component.html',
  styleUrls: ['./album-list.component.css']
})
export class AlbumListComponent implements OnInit {
  albums: any[] = [];
  @ViewChild('carousel') carousel!: ElementRef;

  constructor(private spotifyService: SpotifyService, private router: Router) {}

  ngOnInit() {
    this.spotifyService.getTopAlbums().subscribe(
      (albums) => {
        this.albums = albums;
      },
      (error) => {
        console.error('Error fetching albums:', error);
      }
    );
  }

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }

  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }

  viewAlbumDetails(albumId: string) {
    this.router.navigate([`/album`, albumId]);
  }
}
