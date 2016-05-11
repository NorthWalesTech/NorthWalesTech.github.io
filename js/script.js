/*
 * Thanks JSOxford! ;)
 */
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
(function() {
  'use strict';
  var allEventsQuery = 'https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_urlname=NorthWalesTech&photo-host=public&page=20&fields=&order=time&status=past%2Cupcoming&desc=true&sig_id=187327850&sig=3ad81d8d7483ba049496838b3eaf89a90d07f2d5';
  var membersQuery = 'https://api.meetup.com/2/members?offset=0&format=json&group_urlname=NorthWalesTech&only=photo%2Cname%2Clink&photo-host=secure&page=300&order=name&sig_id=187327850&sig=6d047bd3f80474ac8c9d1cd533aaffad458c592d';

  var maxEventsToShow = window.maxEventsToShow || 10;

  var isSmall = window.matchMedia && window.matchMedia('(max-width: 600px)').matches;

  var members = [];

  // Get members, but only for desktop (don't want to waste peoples money)
  function fetchMembers(url) {
    $.ajax({
      url: url,
      type: 'GET',
      cache: false,
      dataType: 'jsonp',
      crossDomain: true,
      success: function(data) {
        // Currently will only get the first 200(?)
        Array.prototype.push.apply(members, data.results);

        if (data.meta.next) {
          fetchMembers(data.meta.next);
        } else {
          populateMembers();
        }
      },
    });
  }

  fetchMembers(membersQuery);

  function populateMembers() {
    var membersArr = [];
    var otherMembers = 0;
    var mobileIndexes = [];
    var rand;
    var i;

    if (!isSmall) {
      for (i = 0; i < members.length; i++) {
        if (members[i].photo) {
          membersArr.push(
              $('<a/>')
                .addClass('memberThumbnail')
                .attr('href', members[i].link)
                .attr('title', members[i].name).append($('<img/>').attr('src', members[i].photo.thumb_link ).addClass('memberThumbnail'))
          )
        } else {
          otherMembers++;
        }
      }
    } else {
      for (i = 0; i < 15; i++) {
        rand = Math.floor(Math.random() * members.length) + 1;
        while (mobileIndexes.indexOf(rand) >= 0 || !members[rand].photo) {
          rand = Math.floor(Math.random() * members.length) + 1;
        }

        mobileIndexes.push(rand);
        membersArr.push(
          
          
            $('<a/>')
              .addClass('memberThumbnail')
              .attr('href', members[rand].link)
              .attr('title', members[rand].name)
              .append($('<img/>').attr('src', members[rand].photo.thumb_link ).addClass('memberThumbnail'))
        );
      }

      otherMembers = members.length - 15;
    }

    if (otherMembers) {
      membersArr.push($('<a/>').attr('href', 'https://www.meetup.com/NorthWalesTech/members').text('...plus others.'));
    }

    $('#MeetupMembers').append(membersArr);
    $('#Members').removeClass('hidden').find('h3').prepend(members.length + ' ');
  }

  // Get events
  $.ajax({
    url: allEventsQuery + '&offset=0',
    type: 'GET',
    cache: false,
    dataType: 'jsonp',
    crossDomain: true,
    success: function(data) {
      updatePosts(data.results);
    },
  });

  function formatDate(date) {
    var dateString = '';
    dateString += date.getFullYear() + '-';
    if (date.getMonth() + 1 < 10) {
      dateString += '0';
    }

    dateString += (date.getMonth() + 1);
    dateString += '-';
    dateString += date.getDate();
    return dateString;
  }

  function updatePosts(posts) {
    var eventElementsFuture = [];
    var eventElementsPast = [];
    var yesterday = new Date(new Date() - 86400000);
    var now = new Date();
    var i;
    var len;
    var postDate;
    for (i = 0,len = posts.length; i < len; i++) {
      if (true) {
        var eventDate = new Date(posts[i].time);
        
        var upcoming = eventDate >= now;
        
        var eventRendered = buildPost(posts[i], upcoming);
        
        if(upcoming){
          eventElementsFuture.push(eventRendered);
        }
        else {
          eventElementsPast.push(eventRendered);
        }
      }
      /*
      if (posts[i].updated > yesterday) {
        postDate = new Date(posts[i].time);
        $('[data-date^=' + formatDate(postDate) + ']').has('.meetupIcon').each(function()
        {
          var eventDateTime = new Date(posts[i].time);
          var ampm = (eventDateTime.getHours() >= 12 ? 'PM' : 'AM');
          var eventDateString = eventDateTime.toDateString().split(' '); // ['Wed', 'Jul', '15', '2015']
          var eventMonth = eventDateString[1];
          var eventDay = eventDateString[0];
          $(this).find('.title').text(posts[i].name);
          $(this).find('.postContent').html(posts[i].description);
          $(this).find('.attendees').text(posts[i].yes_rsvp_count);
          $(this).find('.eventDate').text(eventDay + ' ' + eventMonth + ' ' + eventDateTime.getDate() + ' ');
          $(this).find('.eventTime').text((eventDateTime.getHours() >= 12 ? eventDateTime.getHours() - 12 : eventDateTime.getHours()) + ':' + (eventDateTime.getMinutes() < 10 ? '0' : '') + eventDateTime.getMinutes() + ' ' + ampm);
        });
      }
      */
    }

    // Sort the events by date
    eventElementsPast = sortEvents(eventElementsPast);
    eventElementsFuture = sortEvents(eventElementsFuture);

    // Display them
    $('#UpcomingEvents').append(eventElementsFuture);
    $('#PastEvents').append(eventElementsPast);
  }

  function buildPost(event, isUpcoming) {
    var eventDate = new Date(event.time);
    var post = $('<div/>');
    var heading = $('<h2/>');
    var link = $('<a/>');
    var meetupImage = $('<img/>').attr('src', 'http://img1.meetupstatic.com/img/94156887029318281691566697/logo.svg').attr('alt', 'Meetup');
    var headingTitle = $('<div/>');

    post.addClass('post');
    post.data('date', eventDate.getFullYear() + '-' + (eventDate.getMonth() < 9 ? '0' : '') + (eventDate.getMonth() + 1) + '-' + eventDate.getDate());
    heading.addClass('post-title row');
    headingTitle.addClass('col-xs-9');
    headingTitle.append(meetupImage);
    link.attr('href', event.event_url);
    link.text(event.name);
    headingTitle.append(link);
    heading.append(headingTitle);
    heading.append(buildPostInfo(event, isUpcoming));
    post.append(heading);
    post.append(event.description);

    return post;
  }

  function buildPostInfo(event, isUpcoming) {
    var eventDateTime = new Date(event.time);
    var ampm = (eventDateTime.getHours() >= 12 ? 'PM' : 'AM');
    var eventInfo = $('<div/>').addClass('eventInfo col-xs-3');
    var eventDateString = eventDateTime.toDateString().split(' '); // ['Wed', 'Jul', '15', '2015']
    var eventMonth = eventDateString[1];
    var eventDay = eventDateString[0];

    var eventDate = $('<span/>')
      .addClass('eventDate')
      .text(
        eventDay + ' ' + eventMonth + ' ' + eventDateTime.getDate() + ' '
      );
    var eventTime = $('<span/>')
      .addClass('eventTime')
      .text(
        (eventDateTime.getHours() >= 12 ? eventDateTime.getHours() - 12 : eventDateTime.getHours()) + ':' + (eventDateTime.getMinutes() < 10 ? '0' : '') + eventDateTime.getMinutes() + ' ' + ampm
      );
    var goingText = (isUpcoming ? 'going' : 'went');
    var going = $('<a/>').attr('href', event.event_url).text(event.yes_rsvp_count + ' ' + goingText);
    eventInfo.append(eventDate).append(eventTime).append('<br>').append(going);
    /* spots left?? 
    if (isUpcoming) {
      var spots = $('<a/>').attr('href', event.event_url).text((event.rsvp_limit - event.yes_rsvp_count) + ' spots left');
      eventInfo.append(spots);
    }
    */

    return eventInfo;
  }

  function sortEvents(events) {
    var sortedEvents = events.sort(function(a, b) {
      // No dates, get out of here!
      if (!a.data('date') || !b.data('date')) return;

      var dateA = new Date(a.data('date').toString().split(' ')[0]);
      var dateB = new Date(b.data('date').toString().split(' ')[0]);
      return dateA === dateB ? 0 : (dateA < dateB ? 1 : -1);
    });

    return sortedEvents;
  }
}());
