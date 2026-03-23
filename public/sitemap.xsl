<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:key name="sections" match="sitemap:url" use="substring-before(substring-after(sitemap:loc, 'sumitsute.com/'), '/')" />
  
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>sitemap</title>
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
          
          .section {
            margin-bottom: 2rem;
          }
          
          .section-header {
            display: flex;
            align-items: baseline;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
            padding-bottom: 0.25rem;
            border-bottom: 1px solid #334155;
          }
          
          .section-name {
            font-size: 0.875rem;
            font-weight: 400;
            text-transform: lowercase;
            color: #f1f5f9;
          }
          
          .section-count {
            font-size: 0.75rem;
            color: #64748b;
          }
          
          .url-list {
            list-style: none;
            padding-left: 1rem;
          }
          
          .url-item {
            padding: 0.25rem 0;
            display: flex;
            align-items: baseline;
            gap: 1rem;
          }
          
          .url-item::before {
            content: '–';
            color: #475569;
            margin-right: 0.5rem;
          }
          
          a {
            color: #cbd5e1;
            text-decoration: none;
          }
          
          a:hover {
            color: #60a5fa;
          }
          
          .url-path {
            color: #64748b;
            font-size: 0.75rem;
          }
          
          .url-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.625rem;
            color: #475569;
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
        </style>
      </head>
      <body>
        <h1>sitemap</h1>
        <p class="meta">
          <span class="count"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></span> urls
        </p>
        
        <xsl:call-template name="render-section">
          <xsl:with-param name="section-name" select="''"/>
          <xsl:with-param name="display-name" select="'pages'"/>
        </xsl:call-template>
        
        <xsl:call-template name="render-section">
          <xsl:with-param name="section-name" select="'about'"/>
          <xsl:with-param name="display-name" select="'about'"/>
        </xsl:call-template>
        
        <xsl:call-template name="render-section">
          <xsl:with-param name="section-name" select="'work'"/>
          <xsl:with-param name="display-name" select="'work'"/>
        </xsl:call-template>
        
        <xsl:call-template name="render-section">
          <xsl:with-param name="section-name" select="'bloq'"/>
          <xsl:with-param name="display-name" select="'bloq'"/>
        </xsl:call-template>
        
        <xsl:call-template name="render-section">
          <xsl:with-param name="section-name" select="'byte'"/>
          <xsl:with-param name="display-name" select="'bytes'"/>
        </xsl:call-template>
        
        <xsl:call-template name="render-section">
          <xsl:with-param name="section-name" select="'blip'"/>
          <xsl:with-param name="display-name" select="'blips'"/>
        </xsl:call-template>
        
        <a href="/" class="home-link">← home</a>
      </body>
    </html>
  </xsl:template>
  
  <xsl:template name="render-section">
    <xsl:param name="section-name"/>
    <xsl:param name="display-name"/>
    
    <xsl:variable name="urls" select="sitemap:urlset/sitemap:url[
      ($section-name = '' and not(contains(substring-after(sitemap:loc, 'sumitsute.com/'), '/'))) or
      ($section-name != '' and starts-with(substring-after(sitemap:loc, 'sumitsute.com/'), concat($section-name, '/')))
    ]"/>
    
    <xsl:if test="$urls">
      <div class="section">
        <div class="section-header">
          <span class="section-name"><xsl:value-of select="$display-name"/></span>
          <span class="section-count">(<xsl:value-of select="count($urls)"/>)</span>
        </div>
        <ul class="url-list">
          <xsl:for-each select="$urls">
            <xsl:sort select="sitemap:priority" order="descending"/>
            <li class="url-item">
              <a href="{sitemap:loc}">
                <xsl:call-template name="format-url">
                  <xsl:with-param name="url" select="sitemap:loc"/>
                </xsl:call-template>
              </a>
              <span class="url-meta">
                <span><xsl:value-of select="sitemap:priority"/></span>
                <span><xsl:value-of select="sitemap:changefreq"/></span>
              </span>
            </li>
          </xsl:for-each>
        </ul>
      </div>
    </xsl:if>
  </xsl:template>
  
  <xsl:template name="format-url">
    <xsl:param name="url"/>
    <xsl:choose>
      <xsl:when test="contains($url, 'sumitsute.com')">
        <xsl:value-of select="substring-after($url, 'sumitsute.com')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$url"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
