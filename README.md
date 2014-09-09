ChromeBookmarks
===============

It is bookmark plugin for Chrome Web browser that store the bookmark in the Social Semantic Server.

For each bookmark the user can choose whether it is shared or not, its label and the tags that are attached to it. Then, the bookmark is store as a URL in a specific folder of the SSS.

Social Semantic Server Requirements
===================================

* Social Semantic Server - v6.0.0-alpha
* Social Semantic Server Client Side - v8.0.0-alpha

Source Code
===========

https://github.com/learning-layers/ChromeBookmarks.git

Installation
============

1. Go to Extensions screen in your Google Chrome
  * Choose "Settings" from the menu and then change to "Extensions"
  * Or just type chrome://extensions/ as an address
2. Make sure the "Developer mode" checkbox at the top right is checked
3. Click "Load unpacked extension..." button and navigate to catalog/folder of where your extension files are (it should be the ROOT catalog)
4. Make sure that extenion is loaded and enabled
5. Click on the "Options" link and fill all the information. Click the "Save" button.
  * The URL of the SSS service should be like: http://example.com/ss-adapter-rest/SSAdapterRest/

How to use
=========

1. Make sure extension is installed, enabled and fully configured.
2. Click on an icon to the right of your address bar (that should be the same icon one could see in the list of installed extensions)
3. Fill any additional information and click "Save Bookmark" button.
  * Tags should be entered as a comma-separated string
  * Clicking on any tag in the tagcloud will add it to the tags input

Problems and solutions
======================

In case you see any red message.

* Please read the message as it might point you to the source of problem.
* Please make sure that extension is peoperly configured
    * Service location and credentials are correct

