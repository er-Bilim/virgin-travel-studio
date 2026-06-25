import type { PipelineStage } from 'mongoose';

interface TourAggregationParams {
  match: PipelineStage.Match['$match'];
  sort: Record<string, 1 | -1>;
  skip?: number;
  limit?: number;
}

export const buildTourPipeline = ({
  match,
  sort,
  skip,
  limit,
}: TourAggregationParams) => {
  const pipeline: PipelineStage[] = [
    { $match: match },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $lookup: {
        from: 'toursets',
        localField: '_id',
        foreignField: 'tourId',
        as: 'tourSets',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        isHot: {
          $anyElementTrue: {
            $map: {
              input: { $ifNull: ['$tourSets', []] },
              as: 'tour_set',
              in: '$$tour_set.isHot',
            },
          },
        },
        minPrice: { $min: '$tourSets.price' },
        discountPrice: { $min: '$tourSets.discountPrice'},
        hotelLocation: { $arrayElemAt: ['$tourSets.hotelLocation', 0] },
        durationDays: {
          $cond: {
            if: { $gt: [{ $size: '$tourSets' }, 0] },
            then: {
              $ceil: {
                $divide: [
                  {
                    $subtract: [
                      { $arrayElemAt: ['$tourSets.endDate', 0] },
                      { $arrayElemAt: ['$tourSets.startDate', 0] },
                    ],
                  },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
            else: null,
          },
        },
        nextStartDate: {
          $min: '$tourSets.startDate',
        },
      },
    },
    { $sort: sort },
    {
      $project: {
        title: 1,
        description: 1,
        images: 1,
        baseAdvantages: 1,
        isPublished: 1,
        rating: 1,
        ratingCount: 1,
        isHot: 1,
        hotelLocation: 1,
        minPrice: 1,
        discountPrice: 1,
        durationDays: 1,
        nextStartDate: 1,
        createdAt: 1,
        updatedAt: 1,
        countryCode: 1,
        'category._id': 1,
        'category.title': 1,
      },
    },
  ];

  if (skip) pipeline.push({ $skip: skip });
  if (limit) pipeline.push({ $limit: limit });

  return pipeline;
};
