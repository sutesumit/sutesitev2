<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>rss feed</title>
        <style>
          :root {
            --xml-bg: rgb(28, 27, 34);
            --xml-surface: rgb(36, 35, 44);
            --xml-surface-2: rgb(49, 47, 60);
            --xml-border: rgb(68, 65, 82);
            --xml-text: rgb(203, 213, 225);
            --xml-text-strong: rgb(241, 245, 249);
            --xml-text-muted: rgb(148, 163, 184);
            --xml-text-faint: rgb(120, 131, 151);
            --xml-text-subtle: rgb(96, 105, 123);
            --xml-accent: #60a5fa;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: 'Roboto Mono', ui-monospace, monospace;
            font-size: 14px;
            background: var(--xml-bg);
            color: var(--xml-text);
            padding: 2.5rem;
            line-height: 1.6;
          }
          
          h1 {
            font-size: 1rem;
            font-weight: 400;
            text-transform: lowercase;
            margin-bottom: 0.5rem;
            color: var(--xml-text-strong);
          }
          
          .meta {
            color: var(--xml-text-muted);
            font-size: 0.75rem;
            margin-bottom: 2rem;
          }
          
          .count {
            color: var(--xml-accent);
          }
          
          .channel-info {
            margin-bottom: 2rem;
            padding: 1rem 1.25rem;
            border: 1px solid var(--xml-border);
            border-radius: 6px;
            background: color-mix(in srgb, var(--xml-surface) 88%, transparent);
          }
          
          .channel-title {
            font-size: 0.875rem;
            color: var(--xml-text-strong);
            margin-bottom: 0.25rem;
          }
          
          .channel-desc {
            font-size: 0.75rem;
            color: var(--xml-text-faint);
          }
          
          .items {
            list-style: none;
          }
          
          .item {
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--xml-surface-2);
          }
          
          .item:last-child {
            border-bottom: none;
          }
          
          .item-title {
            font-size: 0.875rem;
            font-weight: 400;
            margin-bottom: 0.25rem;
          }
          
          .item-title a {
            color: var(--xml-text-strong);
            text-decoration: none;
          }
          
          .item-title a:hover {
            color: var(--xml-accent);
          }
          
          .item-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.625rem;
            color: var(--xml-text-subtle);
            margin-bottom: 0.25rem;
          }
          
          .item-desc {
            font-size: 0.75rem;
            color: var(--xml-text-muted);
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          
          .home-link {
            display: inline-block;
            margin-top: 2rem;
            font-size: 0.75rem;
            color: var(--xml-text-faint);
            text-decoration: none;
          }
          
          .home-link:hover {
            color: var(--xml-accent);
          }
          
          .subscribe-hint {
            margin-top: 1rem;
            padding: 0.75rem;
            background: var(--xml-surface);
            border: 1px solid var(--xml-border);
            border-radius: 6px;
            font-size: 0.75rem;
            color: var(--xml-text-muted);
          }
          
          .subscribe-hint code {
            background: var(--xml-surface-2);
            padding: 0.125rem 0.375rem;
            border-radius: 2px;
            color: var(--xml-text-strong);
          }
        </style>
      </head>
      <body>
        <h1>rss feed</h1>
        <p class="meta">
          <span class="count"><xsl:value-of select="count(rss/channel/item)"/></span> items
        </p>
        
        <div class="channel-info">
          <div class="channel-title"><xsl:value-of select="rss/channel/title"/></div>
          <div class="channel-desc"><xsl:value-of select="rss/channel/description"/></div>
        </div>
        
        <ul class="items">
          <xsl:for-each select="rss/channel/item">
            <li class="item">
              <div class="item-title">
                <a href="{link}"><xsl:value-of select="title"/></a>
              </div>
              <div class="item-meta">
                <span><xsl:call-template name="format-date"><xsl:with-param name="date" select="pubDate"/></xsl:call-template></span>
                <xsl:if test="category">
                  <span><xsl:value-of select="category"/></span>
                </xsl:if>
              </div>
              <xsl:if test="description">
                <div class="item-desc"><xsl:value-of select="description"/></div>
              </xsl:if>
            </li>
          </xsl:for-each>
        </ul>
        
        <div class="subscribe-hint">
          subscribe by adding <code>https://sumitsute.com/feed.xml</code> to your rss reader
        </div>
        
        <a href="/" class="home-link">← home</a>
      </body>
    </html>
  </xsl:template>
  
  <xsl:template name="format-date">
    <xsl:param name="date"/>
    <xsl:if test="$date">
      <xsl:value-of select="substring($date, 1, 11)"/>
    </xsl:if>
  </xsl:template>
</xsl:stylesheet>
