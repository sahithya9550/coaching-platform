const api = 'https://api.razorpay.com/v1/payment_links';

function unavailable(message, status = 503) {
 throw Object.assign(new Error(message), {status});
}

export function createRazorpay(config) {
 const mode = config.RAZORPAY_MODE;
 const key = config.RAZORPAY_KEY_ID;
 const secret = config.RAZORPAY_KEY_SECRET;
 const enabled = ['test','live'].includes(mode) && Boolean(key?.startsWith('rzp_'+mode+'_') && secret);

 async function request(path = '', data) {
  if (!enabled) unavailable('Razorpay checkout is currently unavailable.');
  try {
   const response = await fetch(api+path, {
    method:data === undefined ? 'GET' : 'POST',
    headers:{Authorization:'Basic '+Buffer.from(key+':'+secret).toString('base64'),'Content-Type':'application/json'},
    body:data === undefined ? undefined : JSON.stringify(data),
    signal:AbortSignal.timeout(8000)
   });
   if (response.ok) return await response.json();
  } catch {
   // A retry looks up the booking reference before creating a new link.
  }
  unavailable('Razorpay could not confirm the request. Try again shortly.');
 }

 function reference(booking) {
  return booking.id.replaceAll('-','');
 }

 function check(link, booking) {
  if (!link || !/^plink_[a-zA-Z0-9]+$/.test(link.id) ||
      link.reference_id !== reference(booking) ||
      link.currency !== 'INR' || link.amount !== booking.payload.amount*100) {
   unavailable('Razorpay returned payment details that do not match this booking.');
  }
  return link;
 }

 async function find(booking) {
  const result = await request('?'+new URLSearchParams({reference_id:reference(booking)}));
  if (!Array.isArray(result.payment_links)) unavailable('Razorpay returned an invalid payment link list.');
  const link = result.payment_links.find(item=>item.reference_id===reference(booking));
  return link ? check(link,booking) : null;
 }

 function paid(link) {
  return link?.status === 'paid' && link.amount_paid === link.amount;
 }

 return {
  enabled, mode,
  async checkout(booking) {
   const link = await find(booking) ?? check(await request('', {
    amount:booking.payload.amount*100,
    currency:'INR',
    accept_partial:false,
    reference_id:reference(booking),
    description:'R-IIT Bharat Mentors one-hour lesson',
    expire_by:Math.floor(Date.now()/1000)+86400,
    notify:{sms:false,email:false},
    reminder_enable:false
   }),booking);
   if (paid(link)) return {paid:true};
   if (link.status !== 'created') unavailable('This checkout is no longer open. Contact the team for a new booking.',409);
   const url = new URL(link.short_url);
   if (url.protocol !== 'https:' || !['rzp.io','razorpay.com'].includes(url.hostname) || url.username || url.password || url.port) {
    unavailable('Razorpay returned an invalid checkout link.');
   }
   return {paid:false,url:url.href};
  },
  async isPaid(booking) {
   return paid(await find(booking));
  },
  async closeUnpaid(booking) {
   const link = await find(booking);
   if (!link || ['cancelled','expired'].includes(link.status)) return;
   if (link.status !== 'created') unavailable('Review the Razorpay payment before cancelling this booking.',409);
   const cancelled = await request('/'+link.id+'/cancel',{});
   if (check(cancelled,booking).status !== 'cancelled') unavailable('Razorpay did not confirm cancellation.');
  }
 };
}
