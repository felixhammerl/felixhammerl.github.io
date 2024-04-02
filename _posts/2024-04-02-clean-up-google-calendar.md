---
layout: post
title: Rule-Based Auto-Decline for Your Google Calendar
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: Google Calendar does not offer rule-based uncluttering, but Apps Script offers a workaround.
---

Are you tired of manually managing your calendar and declining unwanted events? Do you wish there was a way to automate this process? Unfortunately, Google Calendar does not offer the same type of functionality when it comes to filtering that Gmail provides. However, [Google Apps Script](https://script.google.com/) provides a small, powerful, and easily maintainable workaround that you can use. In this blog post, we'll explore how you can simplify your calendar management using Google Apps Script.

Apps Script is Google's V8-based (read: "JavaScript") scripting engine to automate tasks in Google Workspace. It offers [APIs for most Google Workspace products](https://developers.google.com/apps-script/reference).

Let's say we get regular invites and updates for certain calendar events. Manually declining each unwanted invitation can be tedious and inefficient. Hence, we'd like to auto-decline them and remove them from the calendar:

```
function autoDeclineAndDeleteEvents() {
  var calendar = CalendarApp.getDefaultCalendar();
  var startDate = new Date()
  startDate.setDate(startDate.getDate() - 7);
  var endDate = new Date();
  endDate.setDate(endDate.getDate() + 365);

  var events = calendar.getEvents(startDate, endDate);
  
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var title = event.getTitle().toLowerCase();
    if (
      title.includes('foo') || 
      title.includes('bar') || 
      title.includes('bla')
    ) {
      event.setMyStatus(CalendarApp.GuestStatus.NO);
      event.deleteEvent();
    }
  }
}
```

Let's go through it one-by-one.

```
var calendar = CalendarApp.getDefaultCalendar();
```
When you run this manually for the first time, Apps Script will ask for the privileges required to edit your calendar. In this case, we choose the default calendar of the logged in Gmail user. If you would like to use a specific calendar, you can also use `getCalendarById` instead ([see documentation](https://developers.google.com/apps-script/reference/calendar/calendar-app#getcalendarbyidid)).

```
var startDate = new Date()
startDate.setDate(startDate.getDate() - 7);
var endDate = new Date();
endDate.setDate(endDate.getDate() + 365);

var events = calendar.getEvents(startDate, endDate);
```

In my case, I would like to remove everything that came in from the last 7 days, and going a year in the future.

```
    var title = event.getTitle().toLowerCase();
```

We'd like to lowercase the title to avoid missing cleaning up certain invites because we didn't get the capitalization quite right.

```
if (
  title.includes('foo') || 
  title.includes('bar') || 
  title.includes('bla')
) {
  event.setMyStatus(CalendarApp.GuestStatus.NO);
  event.deleteEvent();
}
```

Here's the heavy lifting: If the invite meets our criteria, in this case identified by their title "foo", "bar", and "bla", we'd like to decline the invite and remove the event from the calendar. Edit this part to match whatever you would like to decline.

Let's run the script manually once to make sure it has the required permissions by clicking on the `Run` button above the editor.

As a final step, we'd like to run this each morning before we start our workday. Configure a time-driven trigger in the `Triggers` section to run the function `autoDeclineAndDeleteEvents` at the desired intervals, select `Head` as the desired deployment, and you're all set! No additional deployments or installations are necessary.

By leveraging the power of Google Apps Script, you can streamline your calendar management and reclaim valuable time. Whether it's automatically declining unwanted events or performing other routine tasks in Google Workspace, automation can significantly enhance your productivity. Enjoy your uncluttered calendar!
