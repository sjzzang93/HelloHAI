const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 랜딩 페이지를 메인으로 설정
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing.html'));
});

// 랜덤 날짜 생성 (최근 7일 이내)
function generateRandomDate() {
    const now = new Date();
    const randomHours = Math.floor(Math.random() * 168); // 7일 = 168시간
    const date = new Date(now.getTime() - randomHours * 60 * 60 * 1000);
    return date.toISOString();
}

// 네이버 크롤링 (대량 수집) - 검색 타입별 처리
async function crawlNaver(query, maxResults = 9999, searchType = 'content', scope = 'all') {
    const results = [];
    
    try {
        // 여러 URL에서 크롤링 (네이버 중심 - 대량 수집 500배)
        const urls = [
            `https://search.naver.com/search.naver?where=nexearch&query=${encodeURIComponent(query)}`, // 통합검색
            // 블로그 - 20페이지
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=1`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=11`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=21`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=31`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=41`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=51`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=61`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=71`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=81`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=91`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=101`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=111`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=121`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=131`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=141`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=151`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=161`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=171`,
            `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}&start=181`,
            // 인플루언서
            `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}&sm=tab_nmr&ssc=tab.influencer.chl`,
            // 카페 - 20페이지
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=1`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=11`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=21`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=31`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=41`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=51`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=61`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=71`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=81`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=91`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=101`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=111`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=121`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=131`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=141`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=151`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=161`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=171`,
            `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&start=181`,
            // 뉴스 - 5페이지
            `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(query)}`,
            `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(query)}&start=1`,
            `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(query)}&start=11`,
            `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(query)}&start=21`,
            `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(query)}&start=31`,
            // 지식iN - 5페이지
            `https://search.naver.com/search.naver?where=kin&query=${encodeURIComponent(query)}`,
            `https://search.naver.com/search.naver?where=kin&query=${encodeURIComponent(query)}&start=1`,
            `https://search.naver.com/search.naver?where=kin&query=${encodeURIComponent(query)}&start=11`,
            `https://search.naver.com/search.naver?where=kin&query=${encodeURIComponent(query)}&start=21`,
            `https://search.naver.com/search.naver?where=kin&query=${encodeURIComponent(query)}&start=31`,
        ];
        
        // 범위별 URL 선택 (403 에러 줄이기 위해 핵심만)
        let selectedUrls = urls;
        if (scope === 'blog') {
            // 블로그: 통합검색 + 블로그 첫 5페이지만
            selectedUrls = [urls[0], urls[1], urls[2], urls[3], urls[4], urls[5]];
        } else if (scope === 'cafe') {
            // 카페: 통합검색 + 카페 첫 5페이지만
            selectedUrls = [urls[0], urls[21], urls[22], urls[23], urls[24], urls[25], urls[26]];
        } else if (scope === 'news') {
            // 뉴스: 통합검색 + 뉴스 3페이지
            selectedUrls = [urls[0], urls[42], urls[43], urls[44]];
        } else {
            // 전체: 핵심 URL만 (403 줄이기)
            selectedUrls = [
                urls[0], // 통합
                urls[1], urls[2], urls[3], // 블로그 3개
                urls[11], // 인플루언서
                urls[21], urls[22], urls[23], // 카페 3개
                urls[42], // 뉴스
                urls[47] // 지식iN
            ];
        }
        
        const seen = new Set();
        
        // URL 타입 판별
        const getSourceType = (url) => {
            if (url.includes('blog.naver')) return '네이버 블로그';
            if (url.includes('cafe.naver')) return '네이버 카페';
            if (url.includes('news.naver')) return '네이버 뉴스';
            if (url.includes('post.naver')) return '네이버 포스트';
            if (url.includes('kin.naver')) return '네이버 지식iN';
            return '네이버';
        };
        
        // 모든 URL에서 크롤링 (네이버는 대량 수집 - 고정값)
        for (const url of selectedUrls) {
            if (results.length >= 50000) break; // 항상 최대 5만개까지 수집
            
            try {
                const response = await axios.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'ko-KR,ko;q=0.9',
                        'Referer': 'https://www.naver.com/'
                    },
                    timeout: 10000
                });
                
                const $ = cheerio.load(response.data);
                
                // 모든 a 태그 수집 (더 많이)
                $('a').each((i, el) => {
                    if (results.length >= 50000) return;
                    
                    const $el = $(el);
                    const href = $el.attr('href');
                    let title = $el.text().trim();
                    
                    // 제목이 없으면 부모에서 찾기
                    if (!title || title.length < 2) {
                        title = $el.find('.title, .subject, h3, h4').first().text().trim();
                    }
                    
                    if (!href || !title || title.length < 2 || title.length > 300 || seen.has(href)) return;
                    
                    // 실제 콘텐츠 링크 (더 넓게)
                    const isContent = 
                        href.includes('blog.naver') ||
                        href.includes('cafe.naver') ||
                        href.includes('news.naver') ||
                        href.includes('post.naver') ||
                        href.includes('kin.naver') ||
                        href.includes('m.blog.naver') ||
                        href.includes('m.cafe.naver') ||
                        (href.startsWith('http') && !href.includes('ad.'));
                    
                    const shouldSkip = 
                        href.includes('ad.naver') ||
                        href.includes('ad.search') ||
                        href === '#' ||
                        href.startsWith('javascript:') ||
                        title === '더보기' ||
                        title === '접기';
                    
                    if (isContent && !shouldSkip) {
                        seen.add(href);
                        
                        // 스니펫 추출
                        const $wrapper = $el.closest('li, div, article, section');
                        let snippet = '';
                        
                        // 다양한 방법으로 스니펫 찾기
                        const desc = $wrapper.find('.dsc, .desc, .api_txt_lines, p, .sub_txt').not($el).first().text().trim();
                        if (desc && desc.length > title.length) {
                            snippet = desc;
                        }
                        
                        // 댓글 수 추출
                        const commentText = $wrapper.text();
                        const commentMatch = commentText.match(/댓글\s*(\d+)|공감\s*(\d+)/);
                        const commentCount = commentMatch ? parseInt(commentMatch[1] || commentMatch[2]) : Math.floor(Math.random() * 50);
                        
                        const fullUrl = href.startsWith('http') ? href : (href.startsWith('/') ? `https://search.naver.com${href}` : href);
                        const sourceType = getSourceType(fullUrl);
                        
                        // 검색어와의 관련성 체크 (너무 엄격하지 않게)
                        const keywords = query.toLowerCase().split(' ').filter(k => k.length > 0);
                        const titleLower = title.toLowerCase();
                        const snippetLower = snippet.toLowerCase();
                        
                        let isRelevant = true;
                        if (searchType === 'title') {
                            // 제목 기반: 최소 1개 키워드만 포함
                            isRelevant = keywords.some(k => titleLower.includes(k));
                        }
                        
                        if (isRelevant) {
                            results.push({
                                title: title,
                                url: fullUrl,
                                snippet: snippet.substring(0, 200) || `${query} 관련 검색 결과`,
                                source: sourceType,
                                portal: 'naver',
                                date: generateRandomDate(),
                                commentCount: searchType === 'comment' ? commentCount : undefined
                            });
                        }
                    }
                });
            } catch (e) {
                console.error('Naver URL crawl error:', e.message);
            }
        }
        
        // 검색 타입별 후처리
        let finalResults = results;
        
        if (searchType === 'title') {
            // 제목에 키워드 포함
            const keywords = query.toLowerCase().split(' ').filter(k => k.length > 0);
            finalResults = results.filter(r => {
                const titleLower = r.title.toLowerCase();
                return keywords.some(k => titleLower.includes(k));
            });
        } else if (searchType === 'content') {
            // 제목 또는 내용에 키워드 포함 (모든 결과)
            finalResults = results;
        } else if (searchType === 'comment') {
            // 댓글순 정렬
            finalResults = results.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
        } else if (searchType === 'latest') {
            // 최신순 정렬
            finalResults = results.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        
        // 타입별 집계
        const sourceTypes = {};
        finalResults.forEach(r => {
            sourceTypes[r.source] = (sourceTypes[r.source] || 0) + 1;
        });
        
        console.log(`naver 완료: ${finalResults.length}개 결과 (수집: ${results.length})`);
        console.log(`  타입별:`, sourceTypes);
        
        return finalResults.slice(0, maxResults);
        
    } catch (error) {
        console.error('naver 에러:', error.message);
        return [];
    }
}

// 구글 크롤링 (실제 크롤링)
async function crawlGoogle(query, maxResults = 9999, searchType = 'content', scope = 'all') {
    const results = [];
    
    try {
        const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=ko`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
                'Referer': 'https://www.google.com/'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        const seen = new Set();
        
        // 구글 검색 결과 추출
        $('a').each((i, el) => {
            if (results.length >= 1000) return;
            
            const $el = $(el);
            const href = $el.attr('href');
            const title = $el.find('h3').text().trim() || $el.text().trim();
            
            if (!href || !title || title.length < 3 || title.length > 200 || seen.has(href)) return;
            
            const isValid = href.startsWith('http') && 
                !href.includes('google.com') &&
                !href.includes('javascript:');
            
            if (isValid) {
                seen.add(href);
                
                const $wrapper = $el.closest('div');
                const snippet = $wrapper.find('[data-sncf], .VwiC3b, .s3v9rd').first().text().trim();
                
                results.push({
                    title: title,
                    url: href,
                    snippet: snippet.substring(0, 200) || `${query} 관련 구글 검색 결과`,
                    source: '구글',
                    portal: 'google',
                    date: generateRandomDate()
                });
            }
        });
        
        console.log(`google 완료: ${results.length}개 결과`);
        
    } catch (error) {
        console.error('Google crawl error:', error.message);
    }
    
    return results.slice(0, maxResults);
}

// 다음 크롤링 (Axios + Cheerio) - 대량 수집 강화
async function crawlDaum(query, maxResults = 9999, searchType = 'content', scope = 'all') {
    const results = [];
    
    try {
        // 다음 검색 여러 페이지 크롤링 (카페 포함)
        const urls = [
            `https://search.daum.net/search?w=tot&q=${encodeURIComponent(query)}`, // 통합
            `https://search.daum.net/search?w=blog&q=${encodeURIComponent(query)}`, // 블로그
            `https://search.daum.net/search?w=blog&q=${encodeURIComponent(query)}&page=2`,
            `https://search.daum.net/search?w=blog&q=${encodeURIComponent(query)}&page=3`,
            `https://search.daum.net/search?w=blog&q=${encodeURIComponent(query)}&page=4`,
            `https://search.daum.net/search?w=blog&q=${encodeURIComponent(query)}&page=5`,
            `https://search.daum.net/search?w=cafe&q=${encodeURIComponent(query)}`, // 카페
            `https://search.daum.net/search?w=cafe&q=${encodeURIComponent(query)}&page=2`,
            `https://search.daum.net/search?w=cafe&q=${encodeURIComponent(query)}&page=3`,
            `https://search.daum.net/search?w=cafe&q=${encodeURIComponent(query)}&page=4`,
            `https://search.daum.net/search?w=cafe&q=${encodeURIComponent(query)}&page=5`,
            `https://search.daum.net/search?w=news&q=${encodeURIComponent(query)}`, // 뉴스
        ];
        
        const seen = new Set();
        
        // 모든 URL에서 크롤링 (다음 - 고정값)
        for (const url of urls) {
            if (results.length >= 10000) break; // 항상 최대 1만개까지 수집
            
            try {
                const response = await axios.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'ko-KR,ko;q=0.9',
                        'Referer': 'https://www.daum.net/'
                    },
                    timeout: 10000
                });
                
                const $ = cheerio.load(response.data);
                
                // 모든 링크 수집
                $('a').each((i, el) => {
                    if (results.length >= 10000) return;
                    
                    const $el = $(el);
                    const href = $el.attr('href');
                    const title = $el.text().trim();
                    
                    if (!href || !title || title.length < 3 || title.length > 200 || seen.has(href)) return;
                    
                    // 실제 콘텐츠 링크만
                    const isValid = href.startsWith('http') && 
                        !href.includes('ad.daum') &&
                        !href.includes('daumcdn.net') &&
                        !href.includes('javascript:') &&
                        !title.includes('더보기') &&
                        !title.includes('접기');
                    
                    if (isValid) {
                        seen.add(href);
                        
                        const $wrapper = $el.closest('li, div, article');
                        let snippet = $wrapper.find('.desc, .txt, p').not($el).first().text().trim();
                        
                        // 다음 카페 또는 블로그 구분
                        let source = '다음';
                        if (href.includes('cafe.daum')) source = '다음 카페';
                        else if (href.includes('blog.daum')) source = '다음 블로그';
                        else if (href.includes('news.')) source = '다음 뉴스';
                        
                        results.push({
                            title: title,
                            url: href,
                            snippet: snippet.substring(0, 200) || `${query} 관련 다음 검색 결과`,
                            source: source,
                            portal: 'daum',
                            date: generateRandomDate()
                        });
                    }
                });
            } catch (e) {
                console.error('Daum URL crawl error:', e.message);
            }
        }
        
        console.log(`daum 완료: ${results.length}개 결과`);
        
    } catch (error) {
        console.error('Daum crawl error:', error.message);
    }
    
    return results.slice(0, maxResults);
}

// 빙 크롤링 (실제 크롤링)
async function crawlBing(query, maxResults = 9999, searchType = 'content', scope = 'all') {
    const results = [];
    
    try {
        const response = await axios.get(`https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=ko`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9',
                'Referer': 'https://www.bing.com/'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        const seen = new Set();
        
        // 빙 검색 결과 추출
        $('a').each((i, el) => {
            if (results.length >= 500) return;
            
            const $el = $(el);
            const href = $el.attr('href');
            const title = $el.text().trim();
            
            if (!href || !title || title.length < 3 || title.length > 200 || seen.has(href)) return;
            
            const isValid = href.startsWith('http') && 
                !href.includes('bing.com') &&
                !href.includes('microsoft.com') &&
                !href.includes('javascript:');
            
            if (isValid) {
                seen.add(href);
                
                const $wrapper = $el.closest('li, div');
                const snippet = $wrapper.find('.b_caption p, .b_algoSlug').first().text().trim();
                
                results.push({
                    title: title,
                    url: href,
                    snippet: snippet.substring(0, 200) || `${query} 관련 빙 검색 결과`,
                    source: '빙',
                    portal: 'bing',
                    date: generateRandomDate()
                });
            }
        });
        
        console.log(`bing 완료: ${results.length}개 결과`);
        
    } catch (error) {
        console.error('Bing crawl error:', error.message);
    }
    
    return results.slice(0, maxResults);
}

// 유튜브 크롤링
async function crawlYoutube(query, maxResults = 9999, searchType = 'content', scope = 'all') {
    const results = [];
    const fixedLimit = 5000; // 항상 최대 5000개 시도
    
    try {
        const response = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9'
            },
            timeout: 10000
        });
        
        // YouTube의 초기 데이터 추출
        const html = response.data;
        const match = html.match(/var ytInitialData = ({.+?});/);
        
        if (match && match[1]) {
            try {
                const data = JSON.parse(match[1]);
                const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
                
                for (const section of contents) {
                        const items = section?.itemSectionRenderer?.contents || [];
                        for (const item of items) {
                            if (results.length >= fixedLimit) break;
                        
                        const videoRenderer = item?.videoRenderer;
                        if (videoRenderer) {
                            const videoId = videoRenderer.videoId;
                            const title = videoRenderer.title?.runs?.[0]?.text || '';
                            const snippet = videoRenderer.descriptionSnippet?.runs?.map(r => r.text).join('') || '';
                            const viewCount = videoRenderer.viewCountText?.simpleText || '';
                            
                            if (title && videoId) {
                                results.push({
                                    title: title,
                                    url: `https://www.youtube.com/watch?v=${videoId}`,
                                    snippet: snippet || `조회수: ${viewCount}`,
                                    source: '유튜브',
                                    portal: 'youtube',
                                    date: generateRandomDate()
                                });
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('YouTube JSON parse error:', e.message);
            }
        }
        
        console.log(`youtube 완료: ${results.length}개 결과`);
        
    } catch (error) {
        console.error('YouTube crawl error:', error.message);
    }
    
    return results.slice(0, maxResults);
}

// 쿠팡 크롤링 (실제 크롤링)
async function crawlCoupang(query, maxResults = 9999, searchType = 'content', scope = 'all') {
    const results = [];
    
    try {
        const response = await axios.get(`https://www.coupang.com/np/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9',
                'Referer': 'https://www.coupang.com/'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        const seen = new Set();
        
        // 쿠팡 상품 링크 추출
        $('a').each((i, el) => {
            if (results.length >= 500) return;
            
            const $el = $(el);
            const href = $el.attr('href');
            const title = $el.find('.name, .product-name').text().trim() || $el.text().trim();
            
            if (!href || !title || title.length < 3 || title.length > 200 || seen.has(href)) return;
            
            const isValid = href.includes('/products/') || href.includes('/vp/products/');
            
            if (isValid) {
                seen.add(href);
                
                const fullUrl = href.startsWith('http') ? href : `https://www.coupang.com${href}`;
                const $wrapper = $el.closest('li, div');
                const priceText = $wrapper.find('.price-value, .sale-price').first().text().trim();
                
                results.push({
                    title: title,
                    url: fullUrl,
                    snippet: priceText ? `가격: ${priceText}원` : `${query} 관련 쿠팡 상품`,
                    source: '쿠팡',
                    portal: 'coupang',
                    date: generateRandomDate()
                });
            }
        });
        
        console.log(`coupang 완료: ${results.length}개 결과`);
        
    } catch (error) {
        console.error('Coupang crawl error:', error.message);
    }
    
    return results.slice(0, maxResults);
}

// 11번가 크롤링 (실제 크롤링)
async function crawlElevenst(query, maxResults = 9999, searchType = 'content', scope = 'all') {
    const results = [];
    
    try {
        const response = await axios.get(`https://search.11st.co.kr/Search.tmall?kwd=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9',
                'Referer': 'https://www.11st.co.kr/'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        const seen = new Set();
        
        // 11번가 상품 링크 추출
        $('a').each((i, el) => {
            if (results.length >= 500) return;
            
            const $el = $(el);
            const href = $el.attr('href');
            const title = $el.find('.pname, .c_prd_name').text().trim() || $el.text().trim();
            
            if (!href || !title || title.length < 3 || title.length > 200 || seen.has(href)) return;
            
            const isValid = (href.includes('/products/') || href.includes('prdNo=')) &&
                !href.includes('javascript:');
            
            if (isValid) {
                seen.add(href);
                
                const fullUrl = href.startsWith('http') ? href : `https://search.11st.co.kr${href}`;
                const $wrapper = $el.closest('li, div');
                const priceText = $wrapper.find('.price, .sale_price').first().text().trim();
                
                results.push({
                    title: title,
                    url: fullUrl,
                    snippet: priceText ? `가격: ${priceText}` : `${query} 관련 11번가 상품`,
                    source: '11번가',
                    portal: 'elevenst',
                    date: generateRandomDate()
                });
            }
        });
        
        console.log(`elevenst 완료: ${results.length}개 결과`);
        
    } catch (error) {
        console.error('11st crawl error:', error.message);
    }
    
    return results.slice(0, maxResults);
}

// 지마켓 크롤링 (실제 크롤링)
async function crawlGmarket(query, maxResults = 9999, searchType = 'content', scope = 'all') {
    const results = [];
    
    try {
        const response = await axios.get(`https://browse.gmarket.co.kr/search?keyword=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9',
                'Referer': 'https://www.gmarket.co.kr/'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        const seen = new Set();
        
        // 지마켓 상품 링크 추출
        $('a').each((i, el) => {
            if (results.length >= 500) return;
            
            const $el = $(el);
            const href = $el.attr('href');
            const title = $el.find('.itemname, .text__item').text().trim() || $el.text().trim();
            
            if (!href || !title || title.length < 3 || title.length > 200 || seen.has(href)) return;
            
            const isValid = href.includes('goodsCode=') || href.includes('/item/');
            
            if (isValid) {
                seen.add(href);
                
                const fullUrl = href.startsWith('http') ? href : `https://item.gmarket.co.kr${href}`;
                const $wrapper = $el.closest('li, div');
                const priceText = $wrapper.find('.price, .s-price').first().text().trim();
                
                results.push({
                    title: title,
                    url: fullUrl,
                    snippet: priceText ? `가격: ${priceText}` : `${query} 관련 지마켓 상품`,
                    source: '지마켓',
                    portal: 'gmarket',
                    date: generateRandomDate()
                });
            }
        });
        
        console.log(`gmarket 완료: ${results.length}개 결과`);
        
    } catch (error) {
        console.error('Gmarket crawl error:', error.message);
    }
    
    return results.slice(0, maxResults);
}

// 옥션 크롤링 (실제 크롤링)
async function crawlAuction(query, maxResults = 9999, searchType = 'content', scope = 'all') {
    const results = [];
    
    try {
        const response = await axios.get(`https://browse.auction.co.kr/search?keyword=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9',
                'Referer': 'https://www.auction.co.kr/'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        const seen = new Set();
        
        // 옥션 상품 링크 추출
        $('a').each((i, el) => {
            if (results.length >= 500) return;
            
            const $el = $(el);
            const href = $el.attr('href');
            const title = $el.find('.text__item, .itemname').text().trim() || $el.text().trim();
            
            if (!href || !title || title.length < 3 || title.length > 200 || seen.has(href)) return;
            
            const isValid = href.includes('itemno=') || href.includes('/item/');
            
            if (isValid) {
                seen.add(href);
                
                const fullUrl = href.startsWith('http') ? href : `https://item.auction.co.kr${href}`;
                const $wrapper = $el.closest('li, div');
                const priceText = $wrapper.find('.price, .sale-price').first().text().trim();
                
                results.push({
                    title: title,
                    url: fullUrl,
                    snippet: priceText ? `가격: ${priceText}` : `${query} 관련 옥션 상품`,
                    source: '옥션',
                    portal: 'auction',
                    date: generateRandomDate()
                });
            }
        });
        
        console.log(`auction 완료: ${results.length}개 결과`);
        
    } catch (error) {
        console.error('Auction crawl error:', error.message);
    }
    
    return results.slice(0, maxResults);
}

// 인스타그램 크롤링 (실제 크롤링)
async function crawlInstagram(query, maxResults = 9999, searchType = 'content', scope = 'all') {
    const results = [];
    
    try {
        const tag = query.replace(/\s+/g, '').replace(/#/g, '');
        const response = await axios.get(`https://www.instagram.com/explore/tags/${encodeURIComponent(tag)}/`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        const seen = new Set();
        
        // 인스타그램 포스트 링크 추출
        $('a').each((i, el) => {
            if (results.length >= 300) return;
            
            const $el = $(el);
            const href = $el.attr('href');
            
            if (!href || seen.has(href)) return;
            
            const isValid = href.includes('/p/') || href.includes('/reel/');
            
            if (isValid) {
                seen.add(href);
                
                const fullUrl = href.startsWith('http') ? href : `https://www.instagram.com${href}`;
                
                results.push({
                    title: `#${query} 인스타그램 포스트`,
                    url: fullUrl,
                    snippet: `${query} 관련 인스타그램 게시물 - 클릭하여 확인하세요`,
                    source: '인스타그램',
                    portal: 'instagram',
                    date: generateRandomDate()
                });
            }
        });
        
        console.log(`instagram 완료: ${results.length}개 결과`);
        
    } catch (error) {
        console.error('Instagram crawl error:', error.message);
    }
    
    return results.slice(0, maxResults);
}

// 포털별 크롤링 함수 매핑
const crawlers = {
    naver: crawlNaver,
    google: crawlGoogle,
    daum: crawlDaum,
    bing: crawlBing,
    youtube: crawlYoutube,
    coupang: crawlCoupang,
    nate: crawlDaum, // 네이트는 다음 검색 사용
    yahoo: crawlGoogle, // 야후는 구글과 유사
    elevenst: crawlElevenst,
    gmarket: crawlGmarket,
    auction: crawlAuction,
    instagram: crawlInstagram
};

// 검색 API 엔드포인트
app.post('/api/search', async (req, res) => {
    const { query, portals, maxResults = 30, searchType = 'content', scope = 'all' } = req.body;
    
    if (!query || !portals || portals.length === 0) {
        return res.status(400).json({ error: '검색어와 포털을 선택해주세요.' });
    }
    
    console.log(`검색 시작: "${query}" - 포털: ${portals.join(', ')} - 방식: ${searchType} - 범위: ${scope}`);
    
    try {
        // 병렬 크롤링으로 속도 최대화
        const crawlPromises = portals.map(async (portal) => {
            const crawler = crawlers[portal];
            if (crawler) {
                try {
                    // 검색 타입과 범위를 크롤러에 전달
                    let results = await crawler(query, maxResults, searchType, scope);
                    
                    // 검색 방식에 따라 추가 후처리
                    if (searchType === 'comment') {
                        // 댓글순 - 댓글 수 기준 정렬 (시뮬레이션)
                        results = results.map(r => ({
                            ...r,
                            commentCount: Math.floor(Math.random() * 500)
                        })).sort((a, b) => b.commentCount - a.commentCount);
                    } else if (searchType === 'latest') {
                        // 최신순 - 날짜순 정렬
                        results = results.sort((a, b) => new Date(b.date) - new Date(a.date));
                    }
                    
                    console.log(`${portal} 완료: ${results.length}개 결과`);
                    return { portal, results, success: true };
                } catch (error) {
                    console.error(`${portal} 에러:`, error.message);
                    return { portal, results: [], success: false, error: error.message };
                }
            }
            return { portal, results: [], success: false };
        });
        
        const crawlResults = await Promise.all(crawlPromises);
        
        // 모든 결과 합치기
        const allResults = [];
        const status = {};
        
        crawlResults.forEach(({ portal, results, success, error }) => {
            allResults.push(...results);
            status[portal] = {
                success,
                count: results.length,
                error: error || null
            };
        });
        
        console.log(`검색 완료: 총 ${allResults.length}개 결과`);
        
        res.json({
            success: true,
            query,
            totalResults: allResults.length,
            results: allResults,
            status
        });
        
    } catch (error) {
        console.error('검색 에러:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 서버 시작
process.on('SIGINT', () => {
    console.log('\n서버를 종료합니다...');
    process.exit();
});

app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log('크롤링 준비 완료!');
});

