<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>rss feed</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: 'Roboto Mono', ui-monospace, monospace;
            font-size: 14px;
            background: #0f172a;
            color: #cbd5e1;
            padding: 2.5rem;
            line-height: 1.6;
          }
          
          h1 {
            font-size: 1rem;
            font-weight: 400;
            text-transform: lowercase;
            margin-bottom: 0.5rem;
            color: #f1f5f9;
          }
          
          .meta {
            color: #94a3b8;
            font-size: 0.75rem;
            margin-bottom: 2rem;
          }
          
          .count {
            color: #60a5fa;
          }
          
          .channel-info {
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #334155;
          }
          
          .channel-title {
            font-size: 0.875rem;
            color: #f1f5f9;
            margin-bottom: 0.25rem;
          }
          
          .channel-desc {
            font-size: 0.75rem;
            color: #64748b;
          }
          
          .items {
            list-style: none;
          }
          
          .item {
            padding: 0.75rem 0;
            border-bottom: 1px solid #1e293b;
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
            color: #f1f5f9;
            text-decoration: none;
          }
          
          .item-title a:hover {
            color: #60a5fa;
          }
          
          .item-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.625rem;
            color: #475569;
            margin-bottom: 0.25rem;
          }
          
          .item-desc {
            font-size: 0.75rem;
            color: #94a3b8;
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
            color: #64748b;
            text-decoration: none;
          }
          
          .home-link:hover {
            color: #60a5fa;
          }
          
          .subscribe-hint {
            margin-top: 1rem;
            padding: 0.75rem;
            background: #1e293b;
            border-radius: 4px;
            font-size: 0.75rem;
            color: #94a3b8;
          }
          
          .subscribe-hint code {
            background: #334155;
            padding: 0.125rem 0.375rem;
            border-radius: 2px;
            color: #f1f5f9;
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
