import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/axios';
import ProgressOverview from '../components/ProgressOverview';
import QuestionCategory from '../components/QuestionCategory';

import categories from '../static-data/categories.json';
import questions from '../static-data/questions.json';
import subCategories from '../static-data/sub-categories.json';

const getQuestionsAmountForSubCategory = (subCategoryId) =>
	questions.reduce(
		(amount, question) =>
			question.subCategoryId === subCategoryId ? amount + 1 : amount,
		0
	);

const isQuestionInAnswers = (question, answers) =>
	!!answers.find((answer) => answer.questionId === question.id);

const getAnswersAmountForSubCategory = (subCategoryId, rnaAnswers) => {
	const subCategoryQuestions = questions.filter(
		(question) => question.subCategoryId === subCategoryId
	);

	return subCategoryQuestions.reduce(
		(amount, question) =>
			isQuestionInAnswers(question, rnaAnswers) ? amount + 1 : amount,
		0
	);
};

const useViewCategories = (rnaAnswers) => {
	const viewSubCategories = subCategories.map((x) => {
		return {
			...x,
			totalQuestionAmount: getQuestionsAmountForSubCategory(x.id),
			answeredQuestionAmount: getAnswersAmountForSubCategory(
				x.id,
				rnaAnswers
			),
		};
	});

	return categories.map((x) => {
		const categorySubCategories = viewSubCategories.filter(
			(y) => x.id === y.categoryId
		);

		return {
			...x,
			subCategories: categorySubCategories,
			totalQuestionAmount: categorySubCategories.reduce(
				(amount, x) => amount + x.totalQuestionAmount,
				0
			),
			answeredQuestionAmount: categorySubCategories.reduce(
				(amount, x) => amount + x.answeredQuestionAmount,
				0
			),
		};
	});
};

const CategoriesList = () => {
	const { rnaId } = useParams();
	const { data: rnaAnswers = [], isLoading } = useQuery(
		['answers', `${rnaId}`],
		async () => (await api.get(`/rnas/${rnaId}/answers`)).data,
		{ refetchOnWindowFocus: false }
	);

	if (isLoading) {
		return null;
	}

	const viewCategories = useViewCategories(rnaAnswers);

	return (
		<Box>
			<ProgressOverview
				leftColumnAmount={65}
				leftColumnCaption={'Form Completed'}
				rightColumnAmount={1080}
				rightColumnCaption={'Questions Answered'}
			/>
			{viewCategories?.map((x, index) => (
				<QuestionCategory
					key={index}
					title={x.name}
					preview={x.description}
					id={x.id}
					iconSrc={x.iconSrc}
					totalQuestions={x.totalQuestionAmount}
					answeredQusetion={x.answeredQuestionAmount}
					subCategories={x.subCategories}
				></QuestionCategory>
			))}
		</Box>
	);
};

export default CategoriesList;
