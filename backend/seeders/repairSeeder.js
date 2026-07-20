const Repair = require('../models/Repair');
const { generateRepairIssueDescription } = require('../services/textService');
const { randomInt, pickRandom, weightedPick, randomPastDate, addDays } = require('../utils/seedHelpers');

const TOTAL_REPAIRS = 80;
const ISSUE_TYPES = ['stitching', 'zipper', 'button', 'stain-removal', 'alteration', 'patch', 'other'];

const STATUS_WEIGHTS = [
  { value: 'completed', weight: 30 },
  { value: 'delivered', weight: 25 },
  { value: 'in_progress', weight: 15 },
  { value: 'accepted', weight: 12 },
  { value: 'requested', weight: 10 },
  { value: 'rejected', weight: 4 },
  { value: 'cancelled', weight: 4 },
];

async function seedRepairs(buyers, repairPartners, listings) {
  const docs = Array.from({ length: TOTAL_REPAIRS }, () => {
    const status = weightedPick(STATUS_WEIGHTS);
    const issueType = pickRandom(ISSUE_TYPES);
    const isAssigned = status !== 'requested';
    const preferredDate = randomPastDate(180, 3);
    const estimatedCompletionDate = addDays(preferredDate, randomInt(3, 10));
    const isDone = ['completed', 'delivered'].includes(status);

    const progressUpdates = [];
    if (isAssigned) progressUpdates.push({ note: 'Request accepted', status: 'accepted', updatedAt: preferredDate });
    if (['in_progress', 'completed', 'delivered'].includes(status)) {
      progressUpdates.push({ note: 'Repair in progress', status: 'in_progress', updatedAt: addDays(preferredDate, 1) });
    }
    if (isDone) progressUpdates.push({ note: 'Repair completed', status: 'completed', updatedAt: estimatedCompletionDate });
    if (status === 'delivered') progressUpdates.push({ note: 'Delivered to customer', status: 'delivered', updatedAt: addDays(estimatedCompletionDate, 1) });

    return {
      buyer: pickRandom(buyers)._id,
      repairPartner: isAssigned ? pickRandom(repairPartners)._id : undefined,
      listing: Math.random() < 0.6 ? pickRandom(listings)._id : undefined,
      issueType,
      description: generateRepairIssueDescription(issueType),
      preferredDate,
      estimatedCost: randomInt(150, 1200),
      estimatedCompletionDate,
      status,
      rejectionReason: status === 'rejected' ? 'Outside our current repair capacity' : undefined,
      progressUpdates,
      completedAt: isDone ? estimatedCompletionDate : undefined,
      createdAt: preferredDate,
    };
  });

  await Repair.deleteMany({});
  return Repair.insertMany(docs, { ordered: false });
}

module.exports = { seedRepairs };
