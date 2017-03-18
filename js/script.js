// Spotify Module

var Spotify = (function () {

    var localStorageKey = 'artists';

    var favArtists = [];

    var preloadFavArtists = function () {

        var data = localStorage.getItem(localStorageKey);

        if (data !== null) {

            favArtists = JSON.parse(data);
        }

    }


    var getArtistByName = function () {

        var inputArtist = $('#artistFinder').val();

        $.ajax({

            url: 'https://api.spotify.com/v1/search?type=artist&q=' + inputArtist ,
            crossDomain: true,
            dataType: "json"

        }).done(function (data) {

            for(var i = 0; i < data.artists.items.length; i++) {

                drawArtist(data.artists.items[i]);
            }

        }).fail(function (jqXHR, textStatus) {

            console.error('error');

        });

        clearForm();

    }


    var getArtistsById = function () {

        tabFavArtists();

        var artists = favArtists.join(',');

        $.ajax({

            url: 'https://api.spotify.com/v1/artists?ids=' + artists ,
            crossDomain: true,
            dataType: "json"

        }).done(function (data) {

             for(var i = 0; i < data.artists.length; i++) {

                 drawFavArtist(data.artists[i]);

             }
                  

        }).fail(function (jqXHR, textStatus) {

            console.log('error');

        });

    }


    var getAlbumsArtistById = function (artist) {

        $.ajax({

            url: 'https://api.spotify.com/v1/artists/' + artist.id + '/albums?album_type=album&market=AR' ,
            crossDomain: true,
            dataType: "json"

        }).done(function (albums) {

            drawArtistAlbums(artist, albums);

        }).fail(function (jqXHR, textStatus) {

            console.log('error');

        });

    }


    var getAlbumById = function (albumId) {

        $.ajax({

            url: 'https://api.spotify.com/v1/albums/' + albumId ,
            crossDomain: true,
            dataType: "json"

        }).done(function (album) {

            drawAlbum(album);

        }).fail(function (jqXHR, textStatus) {

            console.log('error');

        });

    }


    var clearForm = function () {
    
        $('#artistFinder').val('');

    }


    var drawArtist = function (artist) {

        $('<li/>')
            .addClass('list-group-item')
            .appendTo('#artistResult')
            .attr('id', artist.id);
            
        $('<h4/>')
            .appendTo('#' + artist.id)
            .html(artist.name);
            

        if(artist.images.length > 0) {
        
            $('<img/>')
                .addClass('img-thumbnail')
                .appendTo('#' + artist.id)
                .attr({ src: artist.images[0].url,
                        height: '100',
                        width: '100' });          
        }

        $('<button/>')
            .addClass('btn btn-default btn-sm glyphicon glyphicon-star-empty')
            .appendTo('#' + artist.id)
            .css({ display: 'block', margin: '10px 0' })
            .on('click', function() {

                addToFav(artist.id);

            });
    }


    var drawFavArtist = function (artist) {

        $('<li/>')
            .addClass('list-group-item')
            .appendTo('#favoritesResult')
            .attr('id', artist.id + '-fav');
            
        $('<h4/>')
            .appendTo('#' + artist.id + '-fav')
            .html(artist.name);

        
        if(artist.images.length > 0) {
        
            $('<img/>')
                .addClass('img-thumbnail')
                .appendTo('#' + artist.id + '-fav')
                .attr({ src: artist.images[0].url,
                        height: '100',
                        width: '100' })
                .css({ display: 'block', marginBottom: '10px' });  
        }

        $('<div/>')
            .addClass('btn-group btn-group-sm')
            .appendTo('#' + artist.id + '-fav')
            .attr('id', 'btn-wrap')
            .css('margin-bottom', '10px');

        $('<button/>')
            .addClass('btn btn-default btn-sm glyphicon glyphicon-star')
            .appendTo('#' + artist.id + '-fav #btn-wrap')
            .attr('type', 'button')

        $('<button/>')
            .addClass('btn btn-default btn-sm glyphicon glyphicon-trash')
            .appendTo('#' + artist.id + '-fav #btn-wrap')
            .attr('type', 'button')
            .on('click', function() {

                removeToFavTab(artist.id);

            });

        var $btnFolder = $('<button/>')
            .addClass('btn btn-default btn-sm glyphicon glyphicon-folder-close')
            .appendTo('#' + artist.id + '-fav #btn-wrap')
            // .attr('id', 'btn-folder')
            .on('click', function() {

                iconFolderOpen();
                getAlbumsArtistById(artist)
              
            });

        var iconFolderOpen = function () {

            $btnFolder
                .removeClass('btn btn-default btn-sm glyphicon glyphicon-folder-close')
                .addClass('btn btn-default btn-sm glyphicon glyphicon-folder-open')
                // .on('click', function() {

                //     $('#btn-folder')
                //             .removeClass('btn btn-default btn-sm glyphicon glyphicon-folder-open')
                //             .addClass('btn btn-default btn-sm glyphicon glyphicon-folder-close')
                //             $('#albums-list').fadeOut();
                
                // })
        }
    }


    var drawArtistAlbums = function (artist, albums) {

        $('<ul/>')
            .addClass('list-group')
            .appendTo('#' + artist.id + '-fav')


        for(var i = 0; i < albums.items.length; i++) {

            var $albumsList = $('<li/>')
                .addClass('list-group-item')
                .appendTo('#' + artist.id + '-fav ul')

            $('<a/>')
                .appendTo($albumsList)
                .attr('data-toggle', 'modal')
                .attr('data-target', '#dialogAlbumDetail')
                .attr('href', '#')
                .html(albums.items[i].name)
                .on('click', showAlbumTracks(albums.items[i].id));
        }                
    }


    var showAlbumTracks = function (albumId) {

        return function () {

            $('#dialogAlbumDetail .modal-header').empty();
            $('#dialogAlbumDetail .modal-body').empty();

            getAlbumById(albumId);

        }

    }

    var drawAlbum = function (album) {

         $('<button/>')
                .addClass('close')
                .appendTo('#dialogAlbumDetail .modal-dialog .modal-content .modal-header')
                .attr('type', 'button')
                .attr('data-dismiss', 'modal')
                .html('&times;');

        $('<h4/>')
                .appendTo('#dialogAlbumDetail .modal-dialog .modal-content .modal-header')
                .html(album.name);

        $('<h6/>')
                .appendTo('#dialogAlbumDetail .modal-dialog .modal-content .modal-header')
                .html(moment(album.release_date).format('MM/DD/YYYY'));

        $
    
        $('<img/>')
                .addClass('img-thumbnail')
                .appendTo('#dialogAlbumDetail .modal-dialog .modal-content .modal-header')
                .attr({ src: album.images[0].url,
                                    height: '100',
                                    width: '100' });


        var $ul = $('<ul/>')
                .addClass('list-group')
                .appendTo('#dialogAlbumDetail .modal-dialog .modal-content .modal-body')
                .css('margin-bottom', '0px');
        
        var $trackList;

        var $trackRunTime;

        var $track;

        for(var i = 0; i < album.tracks.items.length; i++) {

            $trackList = $('<li/>')
                .addClass('list-group-item')
                .html(album.tracks.items[i].track_number + '. ')
                .appendTo($ul);

            $track = $('<a/>')
                    .appendTo($trackList)
                    .attr('href', album.tracks.items[i].preview_url)
                    .attr('target', '_blank')
                    .html(album.tracks.items[i].name);

            $trackRunTime = $('<span/>')
                .appendTo($trackList)
                .html(' - ' + moment(album.tracks.items[i].duration_ms).format('mm:ss'));
        }

    }


    var addToFav = function (id) {
    
        $('#' + id + ' button')
            .removeClass('glyphicon glyphicon-star-empty')
            .addClass('glyphicon glyphicon-star')
            .off('click')
            .on('click', function() {

                removeToFav(id);

            });

        favArtists.push(id);

        saveFavArtists();
        
    }

    var removeToFav = function (id) {

        $('#' + id + ' button')
            .removeClass('glyphicon glyphicon-star')
            .addClass('glyphicon glyphicon-star-empty')
            .on('click', function() {

                addToFav(id);

            })

        var pos = $.inArray(id, favArtists);

        favArtists.splice(pos, 1);

        saveFavArtists();
 
    }


    var removeToFavTab = function (id) {

        $('#' + id + '-fav').fadeOut();

        var pos = $.inArray(id, favArtists);

        favArtists.splice(pos, 1);

        saveFavArtists();
 
    }


    var saveFavArtists = function () {

        var data = JSON.stringify(favArtists);
        localStorage.setItem(localStorageKey, data);
    }


    var tabGetArtistByName = function () {

        $('#linkFavoritos')
            .closest('li')
            .removeClass('active');

        $('#linkBuscador')
            .closest('li')
            .addClass('active');

        $('#finderTab')
            .removeClass('hidden');

        $('#favoritesTab')
            .addClass('hidden');

        $('#favoritesResult')
            .empty();

    }

    var tabFavArtists = function () {

        $('#linkFavoritos')
            .closest('li')
            .addClass('active');

        $('#linkBuscador')
            .closest('li')
            .removeClass('active');

        $('#finderTab')
            .addClass('hidden');

        $('#favoritesTab')
            .removeClass('hidden');
    }


    var getFavArtists = function () {

        console.log(favArtists);
    } 


    // Funcion likear eventos
    var linkEvents = function () {

        $('#buscarArtistas').on('click', getArtistByName);
        $('#linkFavoritos').on('click', getArtistsById);
        $('#linkBuscador').on('click', tabGetArtistByName);

    }


    var start = function () {

        preloadFavArtists();
        linkEvents();
    }

    return {

        getFavArtists: getFavArtists,
        start: start

    };


})()


$(document).ready(function () {

    Spotify.start();

});