﻿var ItemDetailPage = {

    onPageShow: function () {

        ItemDetailPage.reload();

        $('#galleryCollapsible', this).on('expand', ItemDetailPage.onGalleryExpand);
    },
    
    onPageHide: function () {

        $('#galleryCollapsible', this).off('expand', ItemDetailPage.onGalleryExpand);

        ItemDetailPage.item = null;
    },

    reload: function () {
        var id = getParameterByName('id');

        Dashboard.showLoadingMsg();

        ApiClient.getItem(Dashboard.getCurrentUserId(), id).done(ItemDetailPage.renderItem);
    },

    renderItem: function (item) {

        ItemDetailPage.item = item;

        var page = $.mobile.activePage;

        ItemDetailPage.item = item;

        var name = item.Name;
        
        if (item.IndexNumber != null) {
            name = item.IndexNumber + " - " + name;
        }

        Dashboard.setPageTitle(name);

        ItemDetailPage.renderImage(item);
        ItemDetailPage.renderOverviewBlock(item);
        ItemDetailPage.renderMediaInfo(item);
        ItemDetailPage.renderGallery(item);

        if (!item.Chapters || !item.Chapters.length) {
            $('#scenesCollapsible', page).remove();
        }else {
            ItemDetailPage.renderScenes(item);
        }
        if (!item.LocalTrailerCount || item.LocalTrailerCount == 0) {
            $('#trailersCollapsible', page).remove();
        }else {
            ItemDetailPage.renderTrailers(item);
        }
        if (!item.SpecialFeatureCount || item.SpecialFeatureCount == 0) {
            $('#specialsCollapsible', page).remove();
        }else {
            ItemDetailPage.renderSpecials(item);
        }

        $('#itemName', page).html(name);

        Dashboard.hideLoadingMsg();
    },

    renderImage: function (item) {

        var page = $.mobile.activePage;

        var imageTags = item.ImageTags || {};

        var html = '';

        var url;
        var useBackgroundColor;

        if (imageTags.Primary) {

            url = ApiClient.getImageUrl(item.Id, {
                type: "Primary",
                width: 800,
                tag: item.ImageTags.Primary
            });
        }
        else if (item.BackdropImageTags && item.BackdropImageTags.length) {

            url = ApiClient.getImageUrl(item.Id, {
                type: "Backdrop",
                width: 800,
                tag: item.BackdropImageTags[0]
            });
        }
        else if (imageTags.Thumb) {

            url = ApiClient.getImageUrl(item.Id, {
                type: "Thumb",
                width: 800,
                tag: item.ImageTags.Thumb
            });
        }
        else if (imageTags.Disc) {

            url = ApiClient.getImageUrl(item.Id, {
                type: "Disc",
                width: 800,
                tag: item.ImageTags.Disc
            });
        }
        else if (item.MediaType == "Audio") {
            url = "css/images/items/detail/audio.png";
            useBackgroundColor = true;
        }
        else if (item.MediaType == "Game") {
            url = "css/images/items/detail/game.png";
            useBackgroundColor = true;
        }
        else {
            url = "css/images/items/detail/video.png";
            useBackgroundColor = true;
        }

        if (url) {

            var style = useBackgroundColor ? "background-color:" + Dashboard.getRandomMetroColor() + ";" : "";

            html += "<img class='itemDetailImage' src='" + url + "' style='" + style + "' />";
        }

        $('#itemImage', page).html(html);
    },

    renderOverviewBlock: function (item) {

        var page = $.mobile.activePage;

        if (item.Taglines && item.Taglines.length) {
            $('#itemTagline', page).html(item.Taglines[0]).show();
        } else {
            $('#itemTagline', page).hide();
        }

        if (item.Overview) {
            $('#itemOverview', page).html(item.Overview).show();
        } else {
            $('#itemOverview', page).hide();
        }

        if (item.CommunityRating) {
            $('#itemCommunityRating', page).html(ItemDetailPage.getStarRating(item)).show().attr('title', item.CommunityRating);
        } else {
            $('#itemCommunityRating', page).hide();
        }

        if (MediaPlayer.canPlay(item)) {
            $('#btnPlay', page).show();
            $('#playButtonShadow', page).show();
        } else {
            $('#btnPlay', page).hide();
            $('#playButtonShadow', page).hide();
        }

        var miscInfo = [];

        if (item.ProductionYear) {
            miscInfo.push(item.ProductionYear);
        }

        if (item.OfficialRating) {
            miscInfo.push(item.OfficialRating);
        }

        if (item.RunTimeTicks) {

            var minutes = item.RunTimeTicks / 600000000;

            minutes = minutes || 1;

            miscInfo.push(parseInt(minutes) + "min");
        }

        if (item.DisplayMediaType) {
            miscInfo.push(item.DisplayMediaType);
        }

        if (item.VideoFormat && item.VideoFormat !== 'Standard') {
            miscInfo.push(item.VideoFormat);
        }

        $('#itemMiscInfo', page).html(miscInfo.join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'));

        ItemDetailPage.renderGenres(item);
        ItemDetailPage.renderStudios(item);
    },

    renderGenres: function (item) {

        var page = $.mobile.activePage;

        if (item.Genres && item.Genres.length) {
            var elem = $('#itemGenres', page).show();

            var html = 'Genres:&nbsp;&nbsp;';

            for (var i = 0, length = item.Genres.length; i < length; i++) {

                if (i > 0) {
                    html += '&nbsp;&nbsp;/&nbsp;&nbsp;';
                }

                html += '<a class="interiorLink" href="#">' + item.Genres[i] + '</a>';
            }

            elem.html(html);


        } else {
            $('#itemGenres', page).hide();
        }
    },

    renderStudios: function (item) {

        var page = $.mobile.activePage;

        if (item.Studios && item.Studios.length) {
            var elem = $('#itemStudios', page).show();

            var html = 'Studios:&nbsp;&nbsp;';

            for (var i = 0, length = item.Studios.length; i < length; i++) {

                if (i > 0) {
                    html += '&nbsp;&nbsp;/&nbsp;&nbsp;';
                }

                html += '<a class="interiorLink" href="#">' + item.Studios[i] + '</a>';
            }

            elem.html(html);


        } else {
            $('#itemStudios', page).hide();
        }
    },

    getStarRating: function (item) {
        var rating = item.CommunityRating;

        var html = "";
        for (var i = 1; i <= 10; i++) {
            if (rating < i - 1) {
                html += "<div class='starRating emptyStarRating'></div>";
            }
            else if (rating < i) {
                html += "<div class='starRating halfStarRating'></div>";
            }
            else {
                html += "<div class='starRating'></div>";
            }
        }

        return html;
    },

    onScenesExpand: function() {

        if (ItemDetailPage.item) {

            ItemDetailPage.renderScenes(ItemDetailPage.item);

            $(this).off('expand', ItemDetailPage.onScenesExpand);
        }
    },

    renderScenes: function (item) {

        var html = '';
        var page = $.mobile.activePage;
        var chapters = item.Chapters || {};

        for (var i = 0, length = chapters.length; i < length; i++) {

            var chapter = chapters[i];
            var chapter_name = chapter.Name || "Chapter "+i;

            html += '<div class="posterViewItem posterViewItemWithDualText">';
            html += '<a href="#play-Chapter-' + i + '" onclick="ItemDetailPage.play('+chapter.StartPositionTicks+');">';

            if (chapter.ImageTag) {

                var imgUrl = ApiClient.getImageUrl(item.Id, {
                    width: 500,
                    tag: chapter.ImageTag,
                    type: "Chapter",
                    index: i
                });

                html += '<img src="' + imgUrl + '" />';
            } else {
                html += '<img src="css/images/items/list/chapter.png"/>';
            }

            html += '<div class="posterViewItemText posterViewItemPrimaryText">' + chapter_name + '</div>';
            html += '<div class="posterViewItemText">';

            if (chapter.StartPositionTicks != "") {
                html += ticks_to_human(chapter.StartPositionTicks);
            }
            else {
                html += "&nbsp;";
            }
            html += '</div>';

            html += '</a>';

            html += '</div>';

        }

        $('#scenesContent', page).html(html);
    },

    play: function (startPosition) {
        MediaPlayer.play([ItemDetailPage.item], startPosition);
    },

    onGalleryExpand: function() {

        if (ItemDetailPage.item) {

            ItemDetailPage.renderGallery(ItemDetailPage.item);

            $(this).off('expand', ItemDetailPage.onGalleryExpand);
        }
    },

    renderGallery: function (item) {

        var page = $.mobile.activePage;
        var imageTags = item.ImageTags || {};
        var html = '';

        if (imageTags.Logo) {

            html += ItemDetailPage.createGalleryImage(item.Id, "Logo", item.ImageTags.Logo);
        }
        if (imageTags.Thumb) {

            html += ItemDetailPage.createGalleryImage(item.Id, "Thumb", item.ImageTags.Thumb);
        }
        if (imageTags.Art) {

            html += ItemDetailPage.createGalleryImage(item.Id, "Art", item.ImageTags.Art);

        }
        if (imageTags.Menu) {

            html += ItemDetailPage.createGalleryImage(item.Id, "Menu", item.ImageTags.Menu);

        }
        if (imageTags.Disc) {

            html += ItemDetailPage.createGalleryImage(item.Id, "Disc", item.ImageTags.Disc);
        }
        if (imageTags.Box) {

            html += ItemDetailPage.createGalleryImage(item.Id, "Box", item.ImageTags.Box);
        }

        if (item.BackdropImageTags) {

            for (var i = 0, length = item.BackdropImageTags.length; i < length; i++) {
                html += ItemDetailPage.createGalleryImage(item.Id, "Backdrop", item.BackdropImageTags[0], i);
            }

        }

        $('#galleryContent', page).html(html).trigger('create');
    },

    createGalleryImage: function(itemId, type, tag, index) {

        var downloadWidth = 400;
        var lightboxWidth = 800;
        var html = '';

        if (typeof(index)=="undefined") index = 0;

        html += '<a href="#pop_'+index+'_'+tag+'" data-transition="fade" data-rel="popup" data-position-to="window">';
        html += '<img class="galleryImage" src="' + ApiClient.getImageUrl(itemId, {
            type: type,
            width: downloadWidth,
            tag: tag,
            index: index
        }) + '" />';
        html += '<div class="galleryPopup" id="pop_'+index+'_'+tag+'" data-role="popup" data-theme="d" data-corners="false" data-overlay-theme="a">';
        html += '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a>';
        html += '<img class="" src="' + ApiClient.getImageUrl(itemId, {
            type: type,
            width: lightboxWidth,
            tag: tag,
            index: index
        }) + '" />';
        html += '</div>';

        return html;
    },
    
    renderMediaInfo: function(item) {
        
        var page = $.mobile.activePage;

        if (!item.MediaStreams || !item.MediaStreams.length) {
            $('#mediaInfoCollapsible', page).hide();
            return;
        }

        $('#mediaInfoCollapsible', page).show();
    },

    playTrailer: function (index) {
        ApiClient.getLocalTrailers(Dashboard.getCurrentUserId(), ItemDetailPage.item.Id).done(function (trailers) {
            MediaPlayer.play([trailers[index]]);
        });
    },

    onTrailersExpand: function() {

        if (ItemDetailPage.item) {

            ItemDetailPage.renderTrailers(ItemDetailPage.item);

            $(this).off('expand', ItemDetailPage.onTrailersExpand);
        }
    },

    renderTrailers: function (item) {

        var html = '';
        var page = $.mobile.activePage;

        ApiClient.getLocalTrailers(Dashboard.getCurrentUserId(), item.Id).done(function (trailers) {

            for (var i = 0, length = trailers.length; i < length; i++) {

                 var trailer = trailers[i];

                 html += '<div class="posterViewItem posterViewItemWithDualText">';
                 html += '<a href="#play-Trailer-' + i + '" onclick="ItemDetailPage.playTrailer('+i+');">';

                 if (trailer.ImageTag) {

                     var imgUrl = ApiClient.getImageUrl(item.Id, {
                         width: 500,
                         tag: trailer.ImageTag,
                         type: "Trailer",
                         index: i
                     });

                     html += '<img src="' + imgUrl + '" />';
                 } else {
                     html += '<img src="css/images/itemDetails/videoDefault.png"/>';
                 }

                 html += '<div class="posterViewItemText posterViewItemPrimaryText">' + trailer.Name + '</div>';
                 html += '<div class="posterViewItemText">';

                 if (trailer.RunTimeTicks != "") {
                    html += ticks_to_human(trailer.RunTimeTicks);
                 }
                 else {
                    html += "&nbsp;";
                 }
                 html += '</div>';

                 html += '</a>';

                 html += '</div>';
            }

            $('#trailersContent', page).html(html);

        });

    },

    playSpecial: function (index) {
        ApiClient.getSpecialFeatures(Dashboard.getCurrentUserId(), ItemDetailPage.item.Id).done(function (specials) {
            MediaPlayer.play([specials[index]]);
        });
    },

    onSpecialsExpand: function() {

        if (ItemDetailPage.item) {

            ItemDetailPage.renderSpecials(ItemDetailPage.item);

            $(this).off('expand', ItemDetailPage.onSpecialsExpand);
        }
    },

    renderSpecials: function (item) {

        var html = '';
        var page = $.mobile.activePage;

        ApiClient.getSpecialFeatures(Dashboard.getCurrentUserId(), item.Id).done(function (specials) {

            for (var i = 0, length = specials.length; i < length; i++) {

                var special = specials[i];

                html += '<div class="posterViewItem posterViewItemWithDualText">';
                html += '<a href="#play-Special-' + i + '" onclick="ItemDetailPage.playSpecial('+i+');">';

                if (special.ImageTag) {

                    var imgUrl = ApiClient.getImageUrl(item.Id, {
                        width: 500,
                        tag: special.ImageTag,
                        type: "Special",
                        index: i
                    });

                    html += '<img src="' + imgUrl + '" />';
                } else {
                    html += '<img src="css/images/itemDetails/videoDefault.png"/>';
                }

                html += '<div class="posterViewItemText posterViewItemPrimaryText">' + special.Name + '</div>';
                html += '<div class="posterViewItemText">';

                if (special.RunTimeTicks != "") {
                    html += ticks_to_human(special.RunTimeTicks);
                }
                else {
                    html += "&nbsp;";
                }
                html += '</div>';

                html += '</a>';

                html += '</div>';
            }

            $('#specialsContent', page).html(html);

        });
    }
};

$(document).on('pageshow', "#itemDetailPage", ItemDetailPage.onPageShow).on('pagehide', "#itemDetailPage", ItemDetailPage.onPageHide);