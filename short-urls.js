// 🚀 HAI 단축 URL 서비스
// 577.kr 스타일의 빠른 접속 시스템

const shortUrls = {
    // 카테고리별 바로가기
    '맛집': { query: '맛집', type: 'title', scope: 'all' },
    '쇼핑': { query: '쇼핑', type: 'content', scope: 'shopping' },
    '뉴스': { query: '뉴스', type: 'latest', scope: 'news' },
    '블로그': { query: '블로그', type: 'comment', scope: 'blog' },
    '여행': { query: '여행', type: 'title', scope: 'all' },
    '부동산': { query: '부동산', type: 'content', scope: 'all' },
    '취업': { query: '취업', type: 'latest', scope: 'all' },
    '게임': { query: '게임', type: 'comment', scope: 'all' },
    
    // 인기 검색어
    '아이폰': { query: '아이폰', type: 'title', scope: 'all' },
    '삼성': { query: '삼성', type: 'title', scope: 'all' },
    '코로나': { query: '코로나', type: 'latest', scope: 'news' },
    '날씨': { query: '날씨', type: 'latest', scope: 'all' },
    '주식': { query: '주식', type: 'latest', scope: 'news' },
    '부동산': { query: '부동산', type: 'content', scope: 'all' },
    '맛집': { query: '맛집', type: 'title', scope: 'all' },
    '여행': { query: '여행', type: 'title', scope: 'all' },
    
    // 지역별
    '강남구': { query: '강남구', type: 'title', scope: 'all' },
    '홍대': { query: '홍대', type: 'title', scope: 'all' },
    '이태원': { query: '이태원', type: 'title', scope: 'all' },
    '명동': { query: '명동', type: 'title', scope: 'all' },
    
    // 쇼핑몰별
    '쿠팡': { query: '쿠팡', type: 'content', scope: 'shopping' },
    '11번가': { query: '11번가', type: 'content', scope: 'shopping' },
    '지마켓': { query: '지마켓', type: 'content', scope: 'shopping' },
    '옥션': { query: '옥션', type: 'content', scope: 'shopping' }
};

// 단축 URL 처리 함수
function handleShortUrl(shortKey) {
    if (shortUrls[shortKey]) {
        const { query, type, scope } = shortUrls[shortKey];
        return {
            redirect: true,
            url: `/index.html?q=${encodeURIComponent(query)}&type=${type}&scope=${scope}`
        };
    }
    return { redirect: false };
}

// 인기 검색어 목록
const popularSearches = [
    '맛집', '쇼핑', '뉴스', '블로그', '여행', 
    '부동산', '취업', '게임', '아이폰', '날씨'
];

// 카테고리별 검색 설정
const categories = {
    '맛집': { icon: '🍽️', desc: '주변 맛집과 리뷰' },
    '쇼핑': { icon: '🛒', desc: '최저가 상품 찾기' },
    '뉴스': { icon: '📰', desc: '최신 뉴스 확인' },
    '블로그': { icon: '📝', desc: '인기 블로그 글' },
    '여행': { icon: '✈️', desc: '여행 정보와 추천' },
    '부동산': { icon: '🏠', desc: '매물 정보 확인' },
    '취업': { icon: '💼', desc: '채용 정보 찾기' },
    '게임': { icon: '🎮', desc: '게임 정보와 공략' }
};

module.exports = {
    shortUrls,
    handleShortUrl,
    popularSearches,
    categories
};
