import mongoose from 'mongoose';

const toggleBooleanFieldHelper = async <T>(
  model: mongoose.Model<T>,
  field: string,
  id: string,
) => {
  const updateData = await model.findByIdAndUpdate(
    id,
    [
      {
        $set: {
          field: { $not: `$${field}` },
        },
      },
    ],
    {
      updatePipeline: true,
      returnDocument: 'after',
    },
  );

  return updateData
};

export default toggleBooleanFieldHelper;
