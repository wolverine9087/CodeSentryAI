export function formatReview(review){return {issues:Array.isArray(review?.issues)?review.issues:[],summary:review?.summary||'',score:Number(review?.score)||0}}
